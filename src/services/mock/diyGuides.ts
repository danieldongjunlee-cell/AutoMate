/**
 * Real, readable DIY car-maintenance guides. Unlike the marketing-style
 * teasers in `data.ts` (PRO_GUIDES / DIY_GUIDES), each entry here has full,
 * follow-along instructions so the user can actually do the job.
 */
export interface DiyGuide {
  id: string;
  title: string;
  emoji: string;
  minutes: number;
  difficulty: 'Easy' | 'Medium';
  tools: string[];
  steps: string[];
  tip?: string;
}

export const DIY_GUIDES: DiyGuide[] = [
  {
    id: 'wiper-blades',
    title: 'Replace wiper blades',
    emoji: '🌧️',
    minutes: 10,
    difficulty: 'Easy',
    tools: ['New wiper blades (check your size)', 'A towel'],
    steps: [
      'Find your blade size in the owner’s manual or measure the old blades — the driver and passenger sides are often different lengths.',
      'Lift the wiper arm away from the windshield until it locks in the upright position. Lay a folded towel on the glass in case an arm snaps back.',
      'Locate the small plastic tab or clip where the blade meets the arm. Press it in to release the lock.',
      'Slide the old blade down the arm and off the hook, keeping the bare metal arm from hitting the windshield.',
      'Line up the new blade’s connector with the hook and slide it on until you hear or feel it click into place.',
      'Gently lower the arm back onto the glass and give the blade a light tug to confirm it’s locked.',
      'Repeat on the other side, then run the wipers with washer fluid to check for streaks.',
    ],
    tip: 'Replace blades every 6–12 months. If they chatter or streak even when new, wipe the rubber edge with a little glass cleaner — road film is often the culprit.',
  },
  {
    id: 'engine-air-filter',
    title: 'Change engine air filter',
    emoji: '🍃',
    minutes: 15,
    difficulty: 'Easy',
    tools: ['New engine air filter', 'Flat screwdriver (sometimes)', 'Shop towel'],
    steps: [
      'With the engine off and cool, open the hood and locate the air filter box — usually a large black plastic box near the front, connected to a wide duct.',
      'Release the housing clips or unscrew the fasteners holding the lid. Some boxes use spring clips you flip up by hand.',
      'Lift the lid and note exactly how the old filter sits (which side faces the engine) before removing it.',
      'Pull out the old filter and wipe any leaves or dirt from inside the empty box with a shop towel.',
      'Seat the new filter in the same orientation, making sure the rubber sealing edge sits flush all around.',
      'Close the lid and re-secure every clip or screw — a loose lid lets in unfiltered air.',
      'Close the hood and you’re done.',
    ],
    tip: 'Hold the old filter up to a light. If light barely passes through, it was overdue. Most cars want a new one every 15,000–30,000 miles, sooner in dusty areas.',
  },
  {
    id: 'cabin-air-filter',
    title: 'Replace cabin air filter',
    emoji: '😮‍💨',
    minutes: 15,
    difficulty: 'Easy',
    tools: ['New cabin air filter', 'Owner’s manual (for location)'],
    steps: [
      'Check your manual for the cabin filter location — most sit behind the glovebox; some are under the hood near the windshield.',
      'For a glovebox filter, empty the glovebox, then squeeze its sides or release the stop arms so it drops down fully.',
      'Behind it you’ll see a rectangular plastic cover. Unclip or slide it off to expose the filter.',
      'Slide the old filter out, watching for an airflow arrow printed on its frame.',
      'Insert the new filter so its airflow arrow points the same direction the old one did (usually downward).',
      'Refit the cover and snap the glovebox back into its normal position.',
      'Run the fan on high for a minute to confirm strong, odor-free airflow.',
    ],
    tip: 'A clogged cabin filter causes weak A/C airflow and musty smells. Replace it about once a year or every 15,000 miles.',
  },
  {
    id: 'tire-pressure',
    title: 'Check & top up tire pressure',
    emoji: '🛞',
    minutes: 15,
    difficulty: 'Easy',
    tools: ['Tire pressure gauge', 'Air pump or gas-station air machine'],
    steps: [
      'Check pressures when tires are cold (driven less than a mile). Find the recommended PSI on the sticker inside the driver’s door jamb — not the number on the tire sidewall.',
      'Unscrew the valve cap on the first tire and keep it somewhere safe.',
      'Press the gauge firmly onto the valve stem until the hissing stops and read the PSI.',
      'If it’s low, attach the air hose and add air in short bursts, re-checking with the gauge as you go.',
      'If it’s over the target, press the small pin inside the valve to let a little air out, then re-check.',
      'Set all four tires to the recommended PSI and reinstall every valve cap.',
      'Don’t forget the spare if your car has one — check it a few PSI above normal since it sits unused.',
    ],
    tip: 'Tires lose about 1 PSI per month and 1 PSI for every 10°F temperature drop. Properly inflated tires last longer and improve fuel economy.',
  },
  {
    id: 'washer-fluid',
    title: 'Top up windshield washer fluid',
    emoji: '💦',
    minutes: 5,
    difficulty: 'Easy',
    tools: ['Washer fluid (not plain water)', 'Funnel (optional)'],
    steps: [
      'Open the hood and find the washer reservoir cap — it’s marked with a windshield/water symbol and usually has a blue or white cap.',
      'Pop the cap off. Most reservoirs are translucent so you can see the current fluid level.',
      'Place a funnel in the opening if you have one, to avoid spills onto hot engine parts.',
      'Pour in washer fluid until it reaches the “full” line or nears the top of the neck.',
      'In freezing climates, use a winter-rated fluid so it won’t freeze and crack the reservoir.',
      'Press the cap back on firmly until it clicks, then test the sprayers and wipers.',
    ],
    tip: 'Avoid plain water — it freezes, grows algae, and doesn’t cut through bug splatter. Dedicated washer fluid is cheap and works in all seasons.',
  },
  {
    id: 'oil-level',
    title: 'Check engine oil level',
    emoji: '🛢️',
    minutes: 10,
    difficulty: 'Easy',
    tools: ['Clean paper towel or rag', 'Engine oil (only if topping up)'],
    steps: [
      'Park on level ground and turn the engine off. Wait 5–10 minutes so the oil drains back into the pan for an accurate reading.',
      'Open the hood and pull out the dipstick — it usually has a brightly colored loop handle.',
      'Wipe the dipstick clean with a paper towel, then fully reinsert it and pull it out again.',
      'Read where the oil film ends. It should sit between the two marks (MIN and MAX, or hatched area).',
      'Check the color too — amber is healthy; very dark or gritty oil suggests it’s due for a change.',
      'If the level is at or below MIN, add a small amount of the correct oil through the filler cap, then re-check. Add gradually — overfilling is harmful.',
      'Reinsert the dipstick fully and close the hood.',
    ],
    tip: 'Check your oil once a month and before long road trips. Never add more than needed to reach MAX — too much oil can foam and damage seals.',
  },
  {
    id: 'key-fob-battery',
    title: 'Replace key fob battery',
    emoji: '🔑',
    minutes: 10,
    difficulty: 'Easy',
    tools: ['New coin battery (often CR2032)', 'Small flat screwdriver', 'Tape (optional)'],
    steps: [
      'If your fob hides a metal emergency key, slide it out — many fobs split open using that key as a lever.',
      'Find the seam around the fob’s edge and gently pry it apart with a small flat screwdriver wrapped in tape to avoid scratches.',
      'Note the battery model printed on the old cell (commonly CR2032) and which side faces up (+ symbol).',
      'Pop out the old battery without bending the metal contacts.',
      'Drop in the new battery the same way up — positive (+) side matching the old one — and avoid touching both faces with your fingers.',
      'Press the two halves back together until the seam clicks shut, then reinsert the emergency key if applicable.',
      'Test lock, unlock, and panic buttons from a few feet away.',
    ],
    tip: 'If the fob still feels weak after a fresh battery, the button contacts may be worn — but a dying battery is by far the most common cause of short range.',
  },
  {
    id: 'jump-start',
    title: 'Jump-start a dead battery',
    emoji: '🔋',
    minutes: 20,
    difficulty: 'Medium',
    tools: ['Jumper cables or a portable jump pack', 'A working donor vehicle (for cables)', 'Gloves & eye protection'],
    steps: [
      'Park the working car nose-to-nose with the dead one, close but not touching. Turn both engines off and set both parking brakes.',
      'Identify the battery terminals: red/“+” is positive, black/“–” is negative.',
      'Clamp one RED cable to the dead battery’s positive (+) terminal, then the other RED end to the good battery’s positive (+) terminal.',
      'Clamp one BLACK cable to the good battery’s negative (–) terminal. Connect the final BLACK clamp to a bare metal bolt or bracket on the dead car’s engine — NOT to its battery — to avoid sparks near the battery.',
      'Start the working car and let it run for 2–3 minutes to feed charge into the dead battery.',
      'Try starting the dead car. If it cranks slowly, wait another few minutes and try again.',
      'Once it starts, remove the clamps in reverse order: black from the engine ground, black from the good battery, red from the good battery, red from the revived battery.',
      'Drive the revived car for at least 20–30 minutes so the alternator can recharge the battery.',
    ],
    tip: 'If the battery dies again soon after, it likely needs replacing or you left something on. Never let the two cars’ bodies touch, and never connect the final black clamp directly to the dead battery’s negative post.',
  },
];
