/**
 * Sample PNG Image Generator
 * Generates sample terrain image files for testing custom local image file analysis.
 */

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const SAMPLE_DIR = path.resolve('data/sample_images');

export function ensureSampleImagesExist() {
  if (!fs.existsSync(SAMPLE_DIR)) {
    fs.mkdirSync(SAMPLE_DIR, { recursive: true });
  }

  const samples = [
    { name: 'sandy_dune.png', color: [210, 180, 130], noise: 15, groundTruth: 'Sandy' },
    { name: 'rocky_pass.png', color: [110, 115, 120], noise: 65, groundTruth: 'Rocky' },
    { name: 'grass_field.png', color: [60, 140, 60], noise: 30, groundTruth: 'Grass' },
    { name: 'marshy_wetland.png', color: [85, 75, 55], noise: 40, sheen: true, groundTruth: 'Marshy' }
  ];

  samples.forEach(s => {
    const filePath = path.join(SAMPLE_DIR, s.name);
    if (!fs.existsSync(filePath)) {
      generateImage(filePath, s.color, s.noise, s.sheen);
    }
  });
}

function generateImage(filePath, baseColor, noiseLevel, addSheen = false) {
  const width = 64;
  const height = 48;
  const png = new PNG({ width, height });

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) * 4;

      const n = (Math.random() - 0.5) * noiseLevel;
      let r = Math.min(255, Math.max(0, baseColor[0] + n));
      let g = Math.min(255, Math.max(0, baseColor[1] + n));
      let b = Math.min(255, Math.max(0, baseColor[2] + n));

      // Add wet sheen reflection spots if requested
      if (addSheen && (x % 12 < 3 && y % 8 < 2)) {
        r = 235;
        g = 235;
        b = 235;
      }

      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = 255;
    }
  }

  const buffer = PNG.sync.write(png);
  fs.writeFileSync(filePath, buffer);
}
