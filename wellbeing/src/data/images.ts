// Auto-registry of everything under src/assets/<section>/*, keyed by
// filename without extension (e.g. "tadasana.jpg" -> "tadasana"). New images
// dropped into those folders are picked up automatically — no manual import
// list to maintain. See scripts/fetch_wellbeing_images.py for how these were
// sourced, and ATTRIBUTION.csv alongside them for license/author per file.
//
// Static thumbnails and animated demo gifs are kept in separate registries
// even though they share one folder tree — a "sarvangasana.gif" living
// alongside "sarvangasana.jpg" must never clobber the static card thumbnail.
const staticModules = import.meta.glob<string>('../assets/*/*.{jpg,jpeg,png,webp,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
});
const gifModules = import.meta.glob<string>('../assets/*/*.gif', {
  eager: true,
  query: '?url',
  import: 'default',
});

function toRegistry(modules: Record<string, string>): Record<string, string> {
  const registry: Record<string, string> = {};
  for (const path in modules) {
    const filename = path.split('/').pop()!;
    const id = filename.replace(/\.[^.]+$/, '');
    registry[id] = modules[path];
  }
  return registry;
}

const REGISTRY = toRegistry(staticModules);
const GIF_REGISTRY = toRegistry(gifModules);

// A handful of practice/content ids don't line up 1:1 with a fetched image
// (several progressions share one reference photo, some content ids were
// renamed after the fetch, etc.) — resolved here rather than scattered
// across the data files.
const ALIASES: Record<string, string> = {
  'surya-namaskar-slow': 'surya-namaskar',
  'surya-namaskar-paced': 'surya-namaskar',
  'dand-knee-supported': 'dand',
  'dand-basic': 'dand',
  'dand-full': 'dand',
  'baithak-basic': 'baithak',
  'baithak-high-rep': 'baithak',
  'baithak-slow-tempo': 'baithak',
  japa: 'om-chanting',
};

export function getImage(id: string): string | undefined {
  return REGISTRY[id] ?? REGISTRY[ALIASES[id]];
}

// Animated step-by-step demo clips — separate from the static card image,
// shown in the practice detail modal and the session player when present.
// Most demo gifs are named after the practice id directly (e.g.
// "sarvangasana.gif"); a few don't follow that convention and are aliased
// here instead.
const DEMO_GIF_ALIASES: Record<string, string> = {
  setubandhasana: 'setu_bandhasana_5_step',
};

export function getDemoGif(id: string): string | undefined {
  return GIF_REGISTRY[id] ?? GIF_REGISTRY[DEMO_GIF_ALIASES[id]];
}

// Per-step posture images live one level deeper, in
// src/assets/<section>/steps/<practice-id>-<step number>.<ext> (1-based, e.g.
// "steps/bhujangasana-2.png" pairs with the practice's second text step).
// Kept out of REGISTRY so a step file can never replace a card thumbnail.
const stepModules = import.meta.glob<string>('../assets/*/steps/*.{jpg,jpeg,png,webp,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
});
const STEP_REGISTRY = toRegistry(stepModules);

// Returns one entry per text step; undefined where no image exists for that step.
export function getStepImages(id: string, stepCount: number): (string | undefined)[] {
  return Array.from({ length: stepCount }, (_, i) => STEP_REGISTRY[`${id}-${i + 1}`]);
}
