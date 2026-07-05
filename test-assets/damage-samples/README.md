# Damage sample photos (pre-release AI test set)

Drop real phone photos of car damage in this folder — the pre-release test
prompt (`docs/prerelease-test-prompt.md`, Phase 5) runs every image here
through the damage-AI service (mock mode, and live mode when
`services/damage-ai/models/damage-seg.pt` exists).

## What to include

- 5–10 **damage** photos: dents, scratches, cracks, paint damage — mixed
  lighting/angles, like real users shoot them.
- 2+ **negative** photos: a clean panel, a random non-car object. These MUST
  take the rejection path (no price shown).
- Keep originals (no screenshots/re-compression) so EXIF rotation is tested.

## manifest.csv

Optional but recommended: one row per image with the expected result, so the
test asserts detections instead of just "didn't crash".

```
filename,expected,part,types,notes
front-bumper-scratch-dent.jpg,damage,Front bumper,"Scratch, Dent",silver sedan; scuffs + dent below right headlight (photo provided in review session)
clean-door-panel.jpg,reject,,,no damage — must hit the rejection path
```

`expected` is `damage` or `reject`; `types` uses the app's damage-type labels
(Dent / Scratch / Crack / Paint). The first row above describes the sample
photo shared during the review session — save that image here under that
filename.
