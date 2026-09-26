// Pre-records the Grandmother's narration with Sarvam AI (Bulbul v3, Indian English),
// one audio clip per sentence, so folktales.html can play it offline with no API key
// in the page. Sentences without a clip fall back to the browser's own voice.
//
// The key is read from SARVAM_API_KEY, or from a line `SARVAM_API_KEY=...` in Kreeda/.env
// (.env is git-ignored).
//
//   node folktales/narrate.mjs --samples                 one short clip per female voice,
//                                                        in folktales/voice-samples/ — listen, pick one
//   node folktales/narrate.mjs --speaker kavitha         record every story sentence with that voice
//   node folktales/narrate.mjs --speaker kavitha --pace 0.85
//
// Re-run after `node folktales/build-stories.mjs` whenever stories change: sentences that
// already have a clip for this speaker + pace are skipped, and clips no longer used are removed.

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(HERE);
const AUDIO_DIR = join(HERE, 'audio');
const MANIFEST = join(HERE, 'audio.js');
const SAMPLES_DIR = join(HERE, 'voice-samples');

const API = 'https://api.sarvam.ai/text-to-speech';
const MODEL = 'bulbul:v3';
const LANGUAGE = 'en-IN';
const FEMALE_VOICES = ['kavitha', 'roopa', 'rupali', 'ritu', 'priya', 'shruti', 'ishita', 'neha',
  'pooja', 'simran', 'kavya', 'shreya', 'suhani', 'tanya'];
const SAMPLE_TEXT = 'Come, sit with me, kanna. Long ago, in the kingdom of Vijayanagara, '
  + 'King Krishnadevaraya had a clever friend named Tenali Rama. Shall I tell you what happened one day?';

/* ---------- args + key ---------- */
const args = process.argv.slice(2);
const flag = name => { const i = args.indexOf(`--${name}`); return i >= 0 ? (args[i + 1] ?? true) : null; };
const samplesMode = args.includes('--samples');
const speaker = flag('speaker');
const pace = flag('pace') ? Number(flag('pace')) : 0.9;

function loadKey() {
  if (process.env.SARVAM_API_KEY) return process.env.SARVAM_API_KEY.trim();
  const envFile = join(ROOT, '.env');
  if (existsSync(envFile)) {
    const m = readFileSync(envFile, 'utf8').match(/^\s*SARVAM_API_KEY\s*=\s*["']?([^"'\s]+)/m);
    if (m) return m[1];
  }
  console.error('No Sarvam key found. Add a line  SARVAM_API_KEY=your-key  to Kreeda/.env');
  process.exit(1);
}
const KEY = loadKey();

if (!samplesMode && (!speaker || speaker === true)) {
  console.error('Pick a voice first:  node folktales/narrate.mjs --samples   then   --speaker <name>');
  process.exit(1);
}
if (!(pace >= 0.5 && pace <= 2)) { console.error('--pace must be between 0.5 and 2'); process.exit(1); }

/* ---------- Sarvam call ---------- */
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function tts(text, voice) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'api-subscription-key': KEY, 'content-type': 'application/json' },
      body: JSON.stringify({
        text, language_code: LANGUAGE, speaker: voice, model: MODEL, pace,
        output_audio_codec: 'mp3', speech_sample_rate: 24000,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      return Buffer.from(json.audios.join(''), 'base64');
    }
    const body = await res.text();
    if ((res.status === 429 || res.status >= 500) && attempt < 5) { await sleep(1000 * 2 ** attempt); continue; }
    throw new Error(`Sarvam ${res.status}: ${body.slice(0, 300)}`);
  }
}

async function pool(items, size, fn) {
  let next = 0;
  await Promise.all(Array.from({ length: size }, async () => {
    while (next < items.length) { const i = next++; await fn(items[i], i); }
  }));
}

/* ---------- samples mode ---------- */
if (samplesMode) {
  mkdirSync(SAMPLES_DIR, { recursive: true });
  const made = [];
  await pool(FEMALE_VOICES, 3, async voice => {
    try {
      writeFileSync(join(SAMPLES_DIR, `${voice}.mp3`), await tts(SAMPLE_TEXT, voice));
      made.push(voice);
      console.log(`✓ ${voice}`);
    } catch (e) { console.log(`✗ ${voice} — ${e.message}`); }
  });
  made.sort((a, b) => FEMALE_VOICES.indexOf(a) - FEMALE_VOICES.indexOf(b));
  writeFileSync(join(SAMPLES_DIR, 'index.html'), `<!DOCTYPE html><meta charset="utf-8"><title>Grandmother voice samples</title>
<style>body{font:15px system-ui;background:#F1E8D2;color:#2A241E;max-width:560px;margin:40px auto;padding:0 16px}
div{display:flex;align-items:center;gap:14px;margin:10px 0}b{width:80px}</style>
<h2>Grandmother voice samples</h2><p>“${SAMPLE_TEXT}”</p><p>Pace ${pace}</p>
${made.map(v => `<div><b>${v}</b><audio controls src="${v}.mp3"></audio></div>`).join('\n')}`);
  console.log(`\nOpen folktales/voice-samples/index.html to listen, then run:\n  node folktales/narrate.mjs --speaker <name>`);
  process.exit(0);
}

/* ---------- story mode ---------- */
// Must produce exactly the texts folktales.html narrates (see renderReader there).
const ctx = { window: {} };
vm.runInNewContext(readFileSync(join(HERE, 'stories.js'), 'utf8'), ctx);
const FOLKTALES = ctx.window.FOLKTALES;
const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
const split = text => [...segmenter.segment(text)].map(s => s.segment.trim()).filter(Boolean);
const LESSON_INTRO = 'And the lesson of this story…';

const texts = new Set();
for (const stories of Object.values(FOLKTALES)) {
  for (const story of stories) {
    for (const t of Object.values(story.text)) {
      split(t.title).forEach(s => texts.add(s));
      t.paragraphs.forEach(p => split(p).forEach(s => texts.add(s)));
      if (t.note) split(t.note).forEach(s => texts.add(s));
      if (t.lesson) { texts.add(LESSON_INTRO); split(t.lesson).forEach(s => texts.add(s)); }
    }
  }
}

mkdirSync(AUDIO_DIR, { recursive: true });
const fileFor = text => createHash('sha1').update(`${MODEL}|${speaker}|${pace}|${text}`).digest('hex').slice(0, 16) + '.mp3';
const files = {};
const todo = [];
for (const text of texts) {
  const name = fileFor(text);
  files[text] = `folktales/audio/${name}`;
  if (!existsSync(join(AUDIO_DIR, name))) todo.push({ text, name });
}

console.log(`${texts.size} sentences · ${texts.size - todo.length} already recorded · ${todo.length} to record with “${speaker}” at pace ${pace}`);
let done = 0, failed = 0;
await pool(todo, 4, async ({ text, name }) => {
  try {
    writeFileSync(join(AUDIO_DIR, name), await tts(text, speaker));
  } catch (e) {
    failed++;
    delete files[text];
    console.log(`\n✗ “${text.slice(0, 60)}…” — ${e.message}`);
  }
  process.stdout.write(`\r  ${++done}/${todo.length}`);
});
if (todo.length) process.stdout.write('\n');

const keep = new Set(Object.values(files).map(f => f.split('/').pop()));
let removed = 0;
for (const f of readdirSync(AUDIO_DIR)) if (!keep.has(f)) { unlinkSync(join(AUDIO_DIR, f)); removed++; }

writeFileSync(MANIFEST,
  '// Generated by folktales/narrate.mjs — sentence text → pre-recorded clip.\n'
  + `window.FOLKTALES_AUDIO = ${JSON.stringify({ speaker, pace, model: MODEL, files }, null, 1)};\n`);

console.log(`Done. ${Object.keys(files).length} clips in folktales/audio/${removed ? ` (${removed} old removed)` : ''}${failed ? ` · ${failed} failed — re-run to retry` : ''}`);
