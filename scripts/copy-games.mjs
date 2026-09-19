import { cp, mkdir, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const gamesDirectory = resolve('games');
const outputDirectory = resolve('dist/games');

await mkdir(outputDirectory, { recursive: true });

for (const entry of await readdir(gamesDirectory, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;

  const source = resolve(gamesDirectory, entry.name, 'site');
  const destination = resolve(outputDirectory, entry.name, 'site');

  try {
    await cp(source, destination, { recursive: true });
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}
