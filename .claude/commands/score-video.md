---
description: Score a demo video to a music track — beat-locked animation, invisible music edits, broadcast-standard mix
argument-hint: <video-or-html> <music-track> [target-length]
---

# Score the video

Arguments: `$ARGUMENTS` — the picture (an `.mp4`, or the `demoNN.html` source if the
animation is still authorable), the music track, and optionally a target length.

You are acting as **music editor and picture editor on the same film**. The job is not
"put a song under a video." The job is to make the cut and the track feel like they were
made for each other, so that a viewer cannot tell which one came first.

The standard to hold yourself to: **Edgar Wright / *Baby Driver*** for frame-accurate
action-to-music sync, **Apple product films** for restraint and rhythmic reveals, and
**Walter Murch's *In the Blink of an Eye*** for why a cut lands — emotion first, rhythm
third, never rhythm alone. If a sync trick does not serve the story beat, cut the trick.

---

## Phase 1 — Spot the picture before touching the music

Build a **spotting sheet** (the term is from film scoring: a timed list of everything the
music has to hit). Do not skip this; every later decision references it.

For each scene, record:

| field | meaning |
|---|---|
| in / out | scene boundaries in seconds and frames |
| beat | what the scene *says* — one clause |
| hit points | the exact frames of reveals: an element popping in, a cursor click, a counter finishing, a stamp landing |
| energy | 1–5, how much lift this moment should carry |

Then draw the **energy curve** across the whole runtime. Almost every good demo film is
`establish → build → peak → resolve`. Find where your peak *should* be (usually the
payoff/verdict scene, not the logo) and mark it. That single timestamp governs the
needle-drop choice in Phase 2.

If the picture came from HTML/CSS keyframes, read the stylesheet and extract every
`animation-delay` into a table. Those numbers are the edit — and unlike a locked
export, **they are still editable**. That is the leverage; see Phase 3.

---

## Phase 2 — Analyse the track: grid, form, energy

Do this numerically, not by ear-guessing.

1. **Tempo and grid.** Compute an onset envelope (spectral flux over a short-time FFT),
   autocorrelate it for the beat period, then refine `(bpm, phase)` by maximising the
   onset energy sampled on a candidate grid. Report BPM to 2 decimals and the time of
   the first beat.
2. **Downbeat phase.** Test all four beat offsets against the accent pattern and pick
   the strongest. You now have `downbeat(n) = phase + n·bar`, `bar = 4·60/BPM`.
3. **Frame conversion.** At `fps`:
   `frames_per_beat = 60·fps/BPM`, `frames_per_bar = 4·frames_per_beat`.
   Print this. Every edit decision from here is quantised in frames, not seconds.
4. **Phrase map.** Music is built in 4-, 8- and 16-bar phrases. Mark every 8-bar
   boundary. **Structural cuts belong on phrase boundaries, never merely on bars.**
5. **Form map.** Label intro / verse / pre / chorus / drop / breakdown / outro with
   timestamps, plus a short-term loudness curve so you can see the arc.
6. **Needle drop.** Choose the start point in the track that puts the track's peak
   under the picture's peak from Phase 1. Starting at 0:00 is a choice, not a default —
   most tracks waste 8–16 bars before they earn attention.

---

## Phase 3 — Bind the picture to the grid (the move that separates this from everything else)

Most editors cut picture to music. If the animation is authored in CSS, do the stronger
thing: **re-author the animation onto the musical grid.**

- Snap every **scene boundary** to a **phrase boundary** (8 bars, or 4 for a fast section).
- Snap every **hit point** — element entrances, cursor clicks, counter completions,
  stamps, chart draws — to a **beat**, and the biggest ones to a **downbeat**.
- Give secondary elements the **offbeat** or the **& of 2**, so the scene has internal
  syncopation instead of everything landing in unison.
- Match **easing to articulation.** Staccato, percussive music wants
  `cubic-bezier(.2,1.3,.4,1)` overshoot pops. Legato, pad-driven music wants
  `cubic-bezier(.16,1,.3,1)` settles. A soft ease under a hard snare reads as lag.
- **Anticipation, not simultaneity.** Perceptually, picture may lead audio by ~1–2 frames
  and still read as locked; audio leading picture reads as an error. When in doubt place
  the visual accent 1 frame *early*.
- Motion duration should be a musical value: 1 beat, ½ beat, or 2 beats. A 0.6s fade at
  107 BPM is nothing; 0.5625s is a beat.

Rebuild the picture from the re-timed source, then re-derive the spotting sheet from the
new render and confirm the numbers moved where you intended.

If the picture is a locked export and cannot be re-timed, invert the approach: warp the
music so its downbeats land on the existing cuts (see Phase 4, time-stretch), and accept
that fewer hit points will land.

---

## Phase 4 — Cut the music invisibly

Length almost never matches. Fix it like a music editor, not by fading out early.

**Rules for every splice:**

- Cut **on a downbeat**, in and out, and remove/repeat whole **phrases** (8 bars) so the
  harmonic progression still resolves. A 4-bar edit that lands on the wrong chord of the
  progression will sound wrong even though it is on the grid.
- **Hide the seam under a transient.** Place the splice immediately before a kick or
  snare; the attack masks the join. This is the single highest-leverage trick in music
  editing.
- **Crossfade shape matters.** Use **equal-power** (`c1=tri:c2=tri` in ffmpeg
  `acrossfade`, or a cosine law) when joining *different* material — linear fades dip
  ~3 dB in the middle and you will hear the hole. Use **equal-gain/linear** only for
  phase-coherent material from the same passage.
- **Length.** Percussive joins: 20–60 ms, essentially a butt cut, splice at a
  **zero crossing** to avoid a click. Sustained/reverberant joins: at least one bar, so
  the reverb tail of the outgoing side is carried rather than chopped.
- **Never cut mid-word** and never leave a truncated reverb tail. If a vocal phrase
  straddles your edit, move the edit — do not shorten the phrase.
- **Time-stretch is a scalpel, not a hammer.** Warping ±3% is inaudible on most material
  and can save an edit; beyond ~6% you get artefacts on transients. Prefer a phrase
  edit over a big stretch.
- **DJ-grade transitions** when a hard join will not work: high-pass filter sweep out /
  low-pass in over 2 bars; a riser into the downbeat; an echo-out (feedback delay on the
  last beat) into silence, then land the new section on the 1.

**If the brief forbids edits entirely** ("play it straight through"), do not sneak one in.
Solve the problem in the mix instead — suppress, duck, or re-arrange the offending
content, and say plainly what you did.

---

## Phase 5 — Sound design under the animation

Music alone reads as a slideshow with a song on it. A small design layer is what makes it
read as a *film*. Keep it subtle — if the viewer notices the whooshes, they are too loud.

- **Transitions:** a short whoosh/riser leading *into* each scene change, peaking 1–2
  frames before the cut. Pitch it away from the track's key centre or it fights the music.
- **Impacts:** a low boom on the hardest structural cut, and only that one. Two impacts is
  one too many.
- **UI:** a soft click on each cursor click, a light tick on counters, a short shimmer on a
  reveal/stamp. Ride these 12–18 dB under the music bed.
- **Negative space:** the most powerful move available is to *drop the music out* for one
  bar before the final reveal. Silence is the loudest thing you have; spend it once.

---

## Phase 6 — Mix to broadcast standard

Numbers, not vibes. Measure with `loudnorm` / EBU R128 (ITU-R BS.1770-4) and report the
values you actually hit.

- **Integrated loudness:** `-14 LUFS` for YouTube/LinkedIn/web, `-16 LUFS` if it will sit
  in a deck or play from a laptop at close range. Music-only films can sit ~1 LU hotter
  than dialogue films.
- **True peak:** `-1.0 dBTP` ceiling. Not `0.0` — lossy encoders overshoot and
  inter-sample peaks will clip on playback.
- **LRA:** aim `8–12 LU`. Flatter than that and the arc from Phase 1 disappears.
- **Voice-over, if any:** sidechain-duck the music `-6 to -9 dB` with a ~200 ms attack and
  ~400 ms release, and carve `2–4 dB` out of the music around `1.5–3 kHz` so the voice has
  its own lane. Never duck by more than you need — pumping is worse than a busy mix.
- **Top and tail:** fade in over the first **bar**, not an arbitrary 1.5 s. End with a
  **musical resolution** — land on a downbeat and fade across the final phrase so the last
  frame of picture and the last of the music arrive together. A track that just stops
  under a logo is the most common tell of an amateur cut.
- **Mono check:** collapse to mono and confirm nothing phase-cancels — most viewers are on
  a phone speaker.

---

## Phase 7 — QC gate (do not deliver until all of these pass)

Verify programmatically and paste the evidence. Assume nothing.

1. Every scene boundary is within **±1 frame** of a bar line — print the table of
   `(boundary, nearest_bar, delta_frames)`.
2. Every declared hit point is within **±1 frame** of its intended beat.
3. No splice shows a click: inspect ±50 ms of samples around each edit for a
   discontinuity, and confirm short-window RMS varies smoothly across the join.
4. Integrated loudness within **0.5 LU** of target; true peak **≤ -1.0 dBTP**; no sample
   equal to full scale.
5. Audio and video durations match to **< 1 frame**.
6. Spot-check frames at each transition to confirm the picture is where you think it is —
   never trust the timeline over the rendered output.
7. **Phone test:** high-pass at 400 Hz and re-listen to the balance. If the mix collapses,
   it was carried entirely by bass.
8. A/B against the previous version and state in one line what improved.

---

## Vocabulary to use when reporting

Spotting sheet · needle drop · hit point · downbeat · phrase boundary · butt cut ·
equal-power crossfade · zero crossing · transient masking · warp marker · time-stretch ·
J-cut / L-cut · anticipation frames · sidechain duck · frequency carve · headroom ·
true peak · LUFS / LRA · negative space · musical resolution · picture lock.

## Hard rules

- **Verify, do not assume.** Measure the render you are delivering, not the plan.
- **Never fabricate a sync claim.** If a hit point missed by 4 frames, say 4 frames.
- **One idea per moment.** An impact *and* a whoosh *and* a flash on the same frame is
  noise, not emphasis.
- **Restraint outranks cleverness.** The goal is that nobody can point to the editing.
- If the brief and good practice conflict, follow the brief and flag the trade-off in one
  sentence.
- Flag licensing: a commercial track will draw an automated copyright claim on public
  platforms. Say so once, and offer a licensed alternative — do not refuse the work.
