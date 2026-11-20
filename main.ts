// Leonida Trophy Guide — hand-in program (Node 22, standard library only).
//
// The guide itself is plain static files in app/ (index.html, app.js,
// style.css, data/trophies.json) plus the screenshots in screenshots/.
// This program copies both folders into the output directory and writes
// dossier.json there with the vendored make.fun library, which is the
// summary the judge reads. vendor/makefun-frontend.ts stays untouched:
// the scorer rebuilds the dossier with its own copy and compares bytes.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for
// /output, e.g. `MAKEFUN_OUTPUT_DIR=out node main.ts`.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The repository root is the folder holding this file.
const root = dirname(fileURLToPath(import.meta.url));

// The grader hands us /output; anywhere else, MAKEFUN_OUTPUT_DIR names it.
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function handIn() {
  mkdirSync(outDir, { recursive: true });

  // The whole guide, exactly as it ships.
  cpSync(join(root, 'app'), join(outDir, 'app'), { recursive: true });

  // The screenshots, if there are any yet.
  const shotsOut = join(outDir, 'screenshots');
  mkdirSync(shotsOut, { recursive: true });
  const shotsIn = join(root, 'screenshots');
  if (existsSync(shotsIn)) cpSync(shotsIn, shotsOut, { recursive: true });

  // The dossier the judge reads: the gate's caps, so a build that would
  // fail the gate fails here first, with the library's own words.
  const dossier = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  });
  writeFileSync(join(outDir, 'dossier.json'), dossier);
  return outDir;
}

const written = handIn();
console.log(`Leonida Trophy Guide handed in to ${written}`);
