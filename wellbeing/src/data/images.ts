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

// Per-step posture images live either in flat legacy form
// src/assets/<section>/steps/<practice-id>-<step number>.<ext>
// or in nested practice folders such as
// src/assets/<section>/steps/<Practice Name>/Step_1.png.
// Kept out of REGISTRY so a step file can never replace a card thumbnail.
const stepModules = import.meta.glob<string>('../assets/*/steps/**/*.{jpg,jpeg,png,webp,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const STEP_ALIASES: Record<string, string[]> = {
  'surya-namaskar-slow': ['surya-namaskar'],
  'surya-namaskar-paced': ['surya-namaskar'],
  'dand-knee-supported': ['dand'],
  'dand-basic': ['dand'],
  'dand-full': ['dand'],
  'baithak-basic': ['baithak'],
  'baithak-high-rep': ['baithak'],
  'baithak-slow-tempo': ['baithak'],
};

function normalizeStepKey(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[`'’()]/g, '')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

function parseStepNumber(rawName: string): number | null {
  const match = rawName.match(/(?:step[s]?)[_\s-]*(\d+)|(?:^|[^a-z0-9])(\d+)(?=$)/i);
  if (!match) return null;
  const value = match[1] ?? match[2];
  return value ? Number(value) : null;
}

function derivePracticeNameFromStepPath(rawPath: string): string | null {
  const pathParts = rawPath.split('/').filter(Boolean);
  const fileName = pathParts[pathParts.length - 1] ?? '';
  const stem = fileName.replace(/\.[^.]+$/, '');
  const lastDirectory = pathParts[pathParts.length - 2];

  if (lastDirectory && lastDirectory !== 'steps') {
    return lastDirectory;
  }

  const withoutStepNumber = stem
    .replace(/(?:step[s]?)[_\s-]*\d+$/i, '')
    .replace(/[-_\s]*\d+$/, '')
    .replace(/[-_\s]+$/, '');

  return withoutStepNumber || null;
}

const STEP_LOOKUP: Record<string, Record<number, string>> = {};

for (const rawPath in stepModules) {
  const fileName = rawPath.split('/').pop() ?? '';
  const stepNumber = parseStepNumber(fileName.replace(/\.[^.]+$/, ''));
  if (stepNumber === null) continue;

  const practiceName = derivePracticeNameFromStepPath(rawPath);
  if (!practiceName) continue;

  const keys = new Set<string>([
    normalizeStepKey(practiceName),
    normalizeStepKey(practiceName.replace(/[-_\s]+/g, ' ')),
  ]);

  for (const key of keys) {
    if (!key) continue;
    if (!STEP_LOOKUP[key]) STEP_LOOKUP[key] = {};
    STEP_LOOKUP[key][stepNumber] = stepModules[rawPath];
  }
}

const PUBLIC_STEP_FOLDERS = new Set<string>([
  'baithak-basic',
  'baithak-high-rep',
  'bhujangasana',
  'dand-basic',
  'dand-full',
  'sapate',
  'sarvangasana',
  'setubandhasana',
  'vyayam-mobility-drills',
].map(normalizeStepKey));

// Returns one entry per text step. For the actual public step folders in this app,
// the path is `/assets/steps/<practice-name>/step_n.png` with the numbered file.
// Legacy `/src/assets/...` step files remain as a fallback only when there is no
// public folder match.
export function getStepImages(id: string, stepCount: number): (string | undefined)[] {
  const candidateNames = Array.from(new Set<string>([
    id,
    ...(STEP_ALIASES[id] ?? []),
    id.replace(/[-_\s]+/g, ' '),
    id.replace(/[-_\s]+/g, ''),
  ].filter(Boolean)));

  const publicFolderNames = candidateNames.filter(name => {
    const normalizedName = normalizeStepKey(name);
    return PUBLIC_STEP_FOLDERS.has(normalizedName);
  });

  const matchedPublicFolder = publicFolderNames[0];

  return Array.from({ length: stepCount }, (_, i) => {
    const stepNumber = i + 1;

    if (matchedPublicFolder) {
      return `/assets/steps/${matchedPublicFolder}/step_${stepNumber}.png`;
    }

    for (const practiceName of candidateNames) {
      const normalized = normalizeStepKey(practiceName);
      const match = STEP_LOOKUP[normalized]?.[stepNumber];
      if (match) return match;
    }

    return undefined;
  });
}
