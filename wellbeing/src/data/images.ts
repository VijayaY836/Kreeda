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
const animationModules = import.meta.glob<string>('../assets/*/*.{gif,webp}', {
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
const ANIMATION_REGISTRY = toRegistry(animationModules);

// A handful of practice/content ids don't line up 1:1 with a fetched image
// (several progressions share one reference photo, some content ids were
// renamed after the fetch, etc.) — resolved here rather than scattered
// across the data files.
const ALIASES: Record<string, string> = {
  'surya-namaskar-slow': 'surya-namaskar',
  'surya-namaskar-paced': 'surya-namaskar',
  'dand-knee-supported': 'dand_knee',
  'dand-basic': 'dand',
  'dand-full': 'dand',
  'baithak-basic': 'baithak',
  'baithak-high-rep': 'baithak',
  'baithak-slow-tempo': 'baithak',
  japa: 'om-chanting',
};

const STEP_FOLDER_ALIASES: Record<string, string> = {
  'loosening-neck': 'Griva Shakti Vikasaka',
  'loosening-shoulder': 'Skandha Chakra',
  'loosening-trunk': 'Kati Chakrasana',
  'loosening-knee': 'Janu Shakti Vikasaka',
  'surya-namaskar-slow': 'Surya Namaskar(Slow)',
  'surya-namaskar-paced': 'Surya Namaskar(Paced)',
  tadasana: 'Tadasana',
  vrikshasana: 'Vrikshasana',
  padahastasana: 'Padahastasana',
  shalabhasana: 'Shalabhasana',
  dhanurasana: 'Dhanurasana',
  setubandhasana: 'Setu Bandhasana',
  uttanapadasana: 'Uttanapadasana',
  pavanamuktasana: 'Pavanamuktasana',
  matsyasana: 'Matsyasana',
  bhujangasana: 'Bhujangasana',
};

function normalizeAssetName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

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
  'dand-knee-supported': 'dand_knee',
  'dand-basic': 'dand_basic',
  'dand-full': 'dand_full',
  'baithak-high-rep': 'high_rep',
  'vyayam-mobility-drills': 'Sukshma Vyayama',
};

export function getDemoGif(id: string): string | undefined {
  return ANIMATION_REGISTRY[id] ?? ANIMATION_REGISTRY[DEMO_GIF_ALIASES[id]];
}

// Per-step posture images can live in either a flat naming format or inside a per-
// exercise folder with numbered files like step_1.png / Step_1.png. Keep these out of
// REGISTRY so they never replace the card thumbnail image.
const stepModules = import.meta.glob<string>('../assets/*/steps/**/*.{jpg,jpeg,png,webp,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
});
const STEP_REGISTRY = toRegistry(stepModules);

export function getStepImages(id: string, stepCount: number): (string | undefined)[] {
  const folderAliases = Array.from(
    new Set([
      id,
      STEP_FOLDER_ALIASES[id] ?? '',
      id.replace(/[-_]/g, ' '),
      id.replace(/[-_]/g, ''),
      (STEP_FOLDER_ALIASES[id] ?? '').replace(/[-_]/g, ' '),
      (STEP_FOLDER_ALIASES[id] ?? '').replace(/[-_]/g, ''),
    ].filter(Boolean))
  );

  const normalizedAliases = folderAliases.map(normalizeAssetName);

  return Array.from({ length: stepCount }, (_, i) => {
    const stepNumber = i + 1;
    const legacyImage = STEP_REGISTRY[`${id}-${stepNumber}`];
    if (legacyImage) return legacyImage;

    const folderMatch = Object.entries(stepModules).find(([path]) => {
      const normalizedPath = path.replace(/\\/g, '/').toLowerCase();
      const filename = path.split('/').pop()?.toLowerCase() ?? '';
      const folderName = path.split('/').slice(-2, -1)[0]?.toLowerCase() ?? '';
      const matchesFolder = normalizedAliases.includes(normalizeAssetName(folderName));
      const matchesStepFile =
        filename.includes(`step${stepNumber}`) ||
        filename.includes(`step_${stepNumber}`) ||
        filename.includes(`step-${stepNumber}`) ||
        filename.includes(`${stepNumber}.png`) ||
        filename.includes(`${stepNumber}.jpg`) ||
        filename.includes(`${stepNumber}.jpeg`) ||
        filename.includes(`${stepNumber}.webp`);

      return matchesFolder && (matchesStepFile || normalizedPath.includes(`/steps/${id.toLowerCase()}/`));
    });

    if (folderMatch) return folderMatch[1];

    return `/assets/steps/${id}/step_${stepNumber}.png`;
  });
}
