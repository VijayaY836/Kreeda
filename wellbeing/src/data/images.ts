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

// Per-step posture images live in two different asset roots:
// - Vyayam assets are served from the public folder at /assets/steps/...
// - Yoga assets live under src/assets/yoga/steps/... and must be Vite-imported
//   so the module system resolves them correctly.
// Kept out of REGISTRY so a step file can never replace a card thumbnail.
const yogaStepModules = import.meta.glob<string>('../assets/yoga/steps/**/*.{jpg,jpeg,png,webp,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const legacyStepModules = import.meta.glob<string>('../assets/*/steps/**/*.{jpg,jpeg,png,webp,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const STEP_ALIASES: Record<string, string[]> = {
  'surya-namaskar-slow': ['surya-namaskar', 'surya namaskar slow', 'Surya Namaskar(Slow)'],
  'surya-namaskar-paced': ['surya-namaskar', 'surya namaskar paced'],
  'dand-knee-supported': ['dand'],
  'dand-basic': ['dand'],
  'dand-full': ['dand'],
  'baithak-basic': ['baithak'],
  'baithak-high-rep': ['baithak'],
  'baithak-slow-tempo': ['baithak'],
  'loosening-neck': ['griva shakti vikasaka', 'Griva Shakti Vikasaka'],
  'loosening-shoulder': ['skandha chakra', 'Skandha Chakra'],
  'loosening-trunk': ['kati chakrasana', 'Kati Chakrasana'],
  'loosening-knee': ['janu shakti vikasaka', 'Janu Shakti Vikasaka'],
  'padahastasana': ['Padahastasana'],
  'tadasana': ['Tadasana'],
  'vrikshasana': ['Vrikshasana'],
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

function buildStepLookup(modules: Record<string, string>): Record<string, Record<number, string>> {
  const lookup: Record<string, Record<number, string>> = {};

  for (const rawPath in modules) {
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
      if (!lookup[key]) lookup[key] = {};
      lookup[key][stepNumber] = modules[rawPath];
    }
  }

  return lookup;
}

const YOGA_STEP_LOOKUP = buildStepLookup(yogaStepModules);
const LEGACY_STEP_LOOKUP = buildStepLookup(legacyStepModules);

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

const PUBLIC_STEP_ALIASES: Record<string, string[]> = {
  dandkneesupported: ['dand-basic'],
  dandbasic: ['dand-basic'],
  dandfull: ['dand-full'],
  baithakbasic: ['baithak-basic'],
  baithakhighrep: ['baithak-high-rep'],
  baithakslowtempo: ['baithak-basic'],
  sapate: ['sapate'],
  vayammobilitydrills: ['vyayam-mobility-drills'],
  vyayammobilitydrills: ['vyayam-mobility-drills'],
  sarvangasana: ['sarvangasana'],
  setubandhasana: ['setubandhasana'],
  bhujangasana: ['bhujangasana'],
};

// Returns one entry per text step. Public Vyayam steps are served from
// /assets/steps/<practice-folder>/step_n.png, while the Yoga steps are resolved via
// Vite module imports from src/assets/yoga/steps/...
export function getStepImages(id: string, stepCount: number): (string | undefined)[] {
  const candidateNames = Array.from(new Set<string>([
    id,
    ...(STEP_ALIASES[id] ?? []),
    id.replace(/[-_\s]+/g, ' '),
    id.replace(/[-_\s]+/g, ''),
  ].filter(Boolean)));

  const publicFolderMatch = Array.from(new Set(
    candidateNames.flatMap(name => {
      const normalized = normalizeStepKey(name);
      return PUBLIC_STEP_ALIASES[normalized] ?? (PUBLIC_STEP_FOLDERS.has(normalized) ? [name] : []);
    }),
  )).find(folder => PUBLIC_STEP_FOLDERS.has(normalizeStepKey(folder)));

  if (publicFolderMatch) {
    return Array.from({ length: stepCount }, (_, i) => {
      const stepNumber = i + 1;
      return `/assets/steps/${publicFolderMatch}/step_${stepNumber}.png`;
    });
  }

  return Array.from({ length: stepCount }, (_, i) => {
    const stepNumber = i + 1;

    for (const practiceName of candidateNames) {
      const normalized = normalizeStepKey(practiceName);
      const yogaMatch = YOGA_STEP_LOOKUP[normalized]?.[stepNumber];
      if (yogaMatch) return yogaMatch;

      const legacyMatch = LEGACY_STEP_LOOKUP[normalized]?.[stepNumber];
      if (legacyMatch) return legacyMatch;
    }

    return undefined;
  });
}
