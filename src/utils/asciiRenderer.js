/**
 * ASCII Terminal Image Preview Generator
 * Converts pixel buffers into ANSI colored ASCII art for terminal inspection.
 */

import chalk from 'chalk';
import boxen from 'boxen';

// Ramp characters from low to high density
const RAMP = [' ', '░', '▒', '▓', '█'];

/**
 * Render raw RGBA image buffer to styled ASCII string
 * @param {Object} imageObj { width, height, data }
 * @param {Object} options { targetWidth, title }
 * @returns {String} Rendered ASCII string ready for console display
 */
export function renderImageToASCII(imageObj, options = {}) {
  const targetWidth = options.targetWidth || 50;
  const { width: srcWidth, height: srcHeight, data } = imageObj;

  // Aspect ratio correction (terminal chars are ~2x taller than wide)
  const fontAspect = 0.45;
  const scale = targetWidth / srcWidth;
  const targetHeight = Math.max(1, Math.round(srcHeight * scale * fontAspect));

  const xRatio = srcWidth / targetWidth;
  const yRatio = srcHeight / targetHeight;

  let asciiLines = [];

  for (let y = 0; y < targetHeight; y++) {
    let line = '';
    const srcY = Math.floor(y * yRatio);

    for (let x = 0; x < targetWidth; x++) {
      const srcX = Math.floor(x * xRatio);
      const idx = (srcY * srcWidth + srcX) * 4;

      const r = data[idx] || 0;
      const g = data[idx + 1] || 0;
      const b = data[idx + 2] || 0;
      const a = data[idx + 3] !== undefined ? data[idx + 3] : 255;

      if (a < 50) {
        line += ' ';
        continue;
      }

      // Perceptual brightness
      const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const charIndex = Math.min(RAMP.length - 1, Math.floor(brightness * RAMP.length));
      const char = RAMP[charIndex];

      // ANSI color styling
      line += chalk.rgb(r, g, b)(char);
    }
    asciiLines.push(line);
  }

  const asciiString = asciiLines.join('\n');

  return boxen(asciiString, {
    title: options.title ? chalk.cyan.bold(options.title) : chalk.cyan.bold('VISION SENSOR TERRAIN FRAME PREVIEW'),
    titleAlignment: 'center',
    padding: 0,
    borderStyle: 'single',
    borderColor: 'cyan'
  });
}
