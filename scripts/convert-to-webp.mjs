import sharp from 'sharp';
import { readdir, rename } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';

const MEDIA_DIR = 'public/media';
const QUALITY = 85;

const files = await readdir(MEDIA_DIR);
const images = files.filter((f) => /\.(jpe?g|png)$/i.test(f));

for (const file of images) {
  const input = join(MEDIA_DIR, file);
  const output = join(MEDIA_DIR, basename(file, extname(file)) + '.webp');
  await sharp(input).webp({ quality: QUALITY }).toFile(output);
  console.log(`✓ ${file} → ${basename(output)}`);
}

console.log(`\nDone: ${images.length} files converted.`);
