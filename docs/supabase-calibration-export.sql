-- Export calibration rows for services/damage-ai/train/calibrate_severity.py.
--
-- Produces the exact CSV columns (part, type, area_ratio, actual_price) by
-- joining each SINGLE-part damage request (its model_json carries the per-part
-- area_ratio) to that user's accepted repair booking (its price_label is the
-- real quoted price).
--
-- Run options:
--   A) Supabase SQL editor → run → "Download CSV".
--   B) One command to a file (needs the DB connection string):
--      psql "$SUPABASE_DB_URL" -c "\copy (<paste the SELECT below>) to 'calibration.csv' csv header"
--   Then: python train/calibrate_severity.py --csv calibration.csv [--apply]
--
-- NOTE on the join: there is no FK from bookings → damage_requests, so each
-- repair booking is matched to that user's most recent damage_request submitted
-- *before* it. For exact joins, add a `damage_request_id` column to bookings and
-- set it when a quote is accepted (see train/README.md). Multi-part requests are
-- skipped (their single quoted total can't be attributed to one part).

with parsed_bookings as (
  select
    b.user_id,
    coalesce(to_timestamp(b.created_at_ms / 1000.0), b.inserted_at) as booked_at,
    -- midpoint of "$320–345" / "$320-345" / "$49"  (handles en-dash and hyphen)
    (
      (regexp_match(b.price_label, '(\d+)'))[1]::numeric
      + coalesce(
          -- second number in "$320–$345" / "$320 - 345" (optional $ and spaces)
          (regexp_match(b.price_label, '\d+\s*[–-]\s*\$?\s*(\d+)'))[1]::numeric,
          (regexp_match(b.price_label, '(\d+)'))[1]::numeric
        )
    ) / 2.0 as actual_price
  from public.bookings b
  where b.kind = 'repair'
    and b.status in ('confirmed', 'paid', 'completed')
    and b.price_label ~ '\d'
),
single_part as (
  select
    dr.user_id,
    dr.created_at,
    dr.model_json->'damages'->0->>'part'                        as part,
    dr.model_json->'damages'->0->>'type'                        as type,
    (dr.model_json->'damages'->0->>'area_ratio')::numeric       as area_ratio
  from public.damage_requests dr
  where dr.model_json is not null
    and jsonb_array_length(dr.model_json->'damages') = 1
    and (dr.model_json->'damages'->0->>'area_ratio') is not null
    and dr.model_json->'damages'->0->>'type' not like '%,%'   -- single type only
)
select
  sp.part,
  sp.type,
  round(sp.area_ratio, 3)   as area_ratio,
  round(pb.actual_price)    as actual_price
from single_part sp
join lateral (
  select p.actual_price
  from parsed_bookings p
  where p.user_id = sp.user_id
    and p.booked_at >= sp.created_at
  order by p.booked_at asc
  limit 1
) pb on true
order by sp.created_at;
