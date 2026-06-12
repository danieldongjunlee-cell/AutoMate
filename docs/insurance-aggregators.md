# Consumer-permissioned insurance-data aggregators — research (Phase 4)

Surveyed June 2026 for the `InsuranceProvider` adapter
(`server/src/insurance/`). All four vendors below follow the same
"Plaid-for-insurance" model: the consumer logs into their carrier inside a
hosted/embedded widget, grants consent, and the aggregator returns structured
policy data (carrier, policy number, coverages, deductibles, premiums,
covered vehicles) to the developer via REST.

## Vendor comparison

| Vendor | Model | Coverage | Integration shape | Pricing notes (public) |
|---|---|---|---|---|
| **Axle** (axle.insure) | Consumer-permissioned auto-insurance data + verification ("universal API for insurance data", Gradient Ventures-backed) | Auto-first; carrier-sourced live data | OAuth-2-style: `POST /ignition` → `ignitionToken` + hosted consent widget → callback `authCode` → `POST /token/exchange` → `accessToken` + policy ids → `GET /policies/{id}`. Headers `x-client-id` / `x-client-secret` / `x-access-token`. Sandbox + test carriers documented. | Not public; usage-based, contact sales |
| **Canopy Connect** (usecanopy.com) | Insurance data intake, "like Plaid for insurance" | 400+ P&C carriers, personal **and** commercial lines, 500+ structured fields | Hosted link / embeddable SDK widget (`publicAlias`) → webhook or poll a **pull**: `GET /pulls/{pull_id}` returns `{pull_id, status, insurance_provider_name, …, policies[]}`. Headers `x-canopy-client-id` / `x-canopy-client-secret`. Free sandbox developer account; sandbox vs production API keys are separate. | Plans start ≈ $95/month; Enterprise = volume-based discounts on pre-committed spend |
| **Covie** (covie.com) | Insurance data access ("Covie Link") | Personal auto, homeowners, renters | Embedded Link widget → Policy API (`developer.covie.com`) to retrieve linked policies | "Only pay for what you use" — graduated per-link pricing, decreases with volume; numbers not public |
| **Trellis** (trellisconnect.com, "Savvy") | Embedded insurance marketplace; connect-existing-account prefill is a means to quote/switch | Auto + homeowners | Savvy SDK embed; account-connection prefill feeds their comparison/purchase flow rather than a pure data API | Not public; revenue model is commission on policy sales |

## Decision — reference adapter: **Axle**

Picked `axleProvider.ts` as the reference implementation because:

1. **Auto-first** — AutoMate only needs auto policies; Axle's policy object
   (carrier, `policyNumber`, `premium`, `expirationDate`, `coverages[]` with
   per-coverage `deductible`, `properties[]` with vehicle VIN/make/model/year)
   maps 1:1 onto our `NormalizedPolicy`.
2. **Cleanest documented flow** — the ignition → authCode → token-exchange →
   fetch sequence is plain OAuth-2-shaped REST (docs.axle.insure), trivially
   expressed as `connect()` + `fetchPolicies()` on our adapter interface.
3. **Sandbox** — test credentials/carriers exist, so the skeleton can be
   exercised without a commercial agreement.

Canopy Connect is the strongest alternative (broadest carrier coverage,
public-ish pricing, free sandbox) and would slot into the same interface as a
`canopyProvider.ts` — its "pull" maps to our link session and
`pull.policies[]` to `fetchPolicies()`. Worth revisiting if AutoMate ever
needs homeowners/commercial lines.

## How it plugs in here

- `InsuranceProvider` interface: `server/src/insurance/InsuranceProvider.ts`.
- `axleProvider.ts`: skeleton coded to Axle's documented API shape
  (`AXLE_API_URL`, `AXLE_CLIENT_ID`, `AXLE_CLIENT_SECRET` envs). Never
  required for the app to run.
- `mockProvider.ts`: default (`INSURANCE_PROVIDER=mock` or unset) — returns
  the seeded State Farm policy plus a Geico sample so the connect flow demos
  offline.
- Fallbacks that always work regardless of aggregator: manual entry
  (prof-ins-add form) and insurance-card scan (damage-ai OCR pipeline,
  `POST /insurance-card`).

## Sources

- https://docs.axle.insure/guides/quickstart, https://docs.axle.insure/welcome,
  https://www.axle.insure/product/api
- https://docs.usecanopy.com/ (REST API reference, getting started, webhooks),
  https://www.usecanopy.com/api, https://www.usecanopy.com/api/api-plans
- https://www.covie.com/pricing, https://developer.covie.com/docs/link-access/branches/main/f7ec3538d8a6c-policy-api
- https://trellisconnect.com/savvy/, https://github.com/trellisconnect/savvy-sdk-docs
- https://techcrunch.com/2023/04/10/gradient-ventures-axle-plaid-insurance-verification/
