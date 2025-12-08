import fs from 'fs';
import path from 'path';
import { getFilesFromTxt, getMediaExtension } from './utils.js';

const INPUT_DIR = path.join('data', 'text_files');
const OUTPUT_JSON = path.join('data', 'samples.json');

// Allowed media types to test visually
const SUPPORTED = [
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'heic',
  'jfif', 'bmp', 'tiff', 'svg',
  'mp4', 'mov', 'webm', 'mkv', 'm4v'
];

let samples = [];

for (const file of fs.readdirSync(INPUT_DIR)) {
  if (!file.endsWith('.txt')) continue;

  const zipName = file.replace('.txt', '');
  const filePaths = getFilesFromTxt(path.join(INPUT_DIR, file));

  const byExt = {};

  for (const fp of filePaths) {
    const ext = getMediaExtension(fp);
    if (!SUPPORTED.includes(ext)) continue;

    if (!byExt[ext]) byExt[ext] = [];
    byExt[ext].push(fp);
  }

  for (const ext in byExt) {
    const all = byExt[ext];
    const count = all.length;

    let chosen = [];

    if (count >= 50) {
      // pick random 50
      chosen = all.sort(() => 0.5 - Math.random()).slice(0, 50);
    } else {
      chosen = all; // open all <50
    }

    chosen.forEach(fp => {
      samples.push({
        zipName,
        filePath: fp,
        ext
      });
    });
  }
}

// Save final set of samples
fs.writeFileSync(OUTPUT_JSON, JSON.stringify(samples, null, 2));

console.log(`Created samples.json with ${samples.length} media items.`);
