-- Export calibration rows for services/damage-ai/train/calibrate_severity.py.
--
-- Produces the exact CSV columns (part, type, area_ratio, actual_price) by
-- joining each SINGLE-part damage request (its model_json carries the per-part
-- area_ratio) to the repair booking it was quoted into (price_label → price).
--
-- Run options:
--   A) Supabase SQL editor → run → "Download CSV".
--   B) One command to a file (needs the DB connection string):
--      psql "$SUPABASE_DB_URL" -c "\copy (<paste the SELECT below>) to 'calibration.csv' csv header"
--   Then: python train/calibrate_severity.py --csv calibration.csv [--apply]
--
-- Join precision: bookings carry `damage_request_id` (set when a quote is
-- accepted), so the join is EXACT for new bookings. Older rows without it fall
-- back to "this user's most recent damage_request submitted before the booking".
-- Multi-part / multi-type requests are skipped (one quoted total can't be
-- attributed to a single part).

with parsed_bookings as (
  select
    b.user_id,
    b.damage_request_id,
    coalesce(to_timestamp(b.created_at_ms / 1000.0), b.inserted_at) as booked_at,
    -- midpoint of "$320–$345" / "$320 - 345" / "$49" (handles en-dash, hyphen,
    -- and a second leading $)
    (
      (regexp_match(b.price_label, '(\d+)'))[1]::numeric
      + coalesce(
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
    dr.id,
    dr.user_id,
    dr.created_at,
    dr.model_json->'damages'->0->>'part'                  as part,
    dr.model_json->'damages'->0->>'type'                  as type,
    (dr.model_json->'damages'->0->>'area_ratio')::numeric as area_ratio
  from public.damage_requests dr
  where dr.model_json is not null
    and jsonb_array_length(dr.model_json->'damages') = 1
    and (dr.model_json->'damages'->0->>'area_ratio') is not null
    and dr.model_json->'damages'->0->>'type' not like '%,%'   -- single type only
)
select
  sp.part,
  sp.type,
  round(sp.area_ratio, 3) as area_ratio,
  round(pb.actual_price)  as actual_price
from single_part sp
join lateral (
  select p.actual_price
  from parsed_bookings p
  where p.damage_request_id = sp.id                          -- exact link, or
     or (p.damage_request_id is null                          -- legacy heuristic:
         and p.user_id = sp.user_id
         and p.booked_at >= sp.created_at)
  order by (p.damage_request_id = sp.id) desc nulls last,     -- prefer exact
           p.booked_at asc
  limit 1
) pb on true
order by sp.created_at;
