/**
 * Image Parser & Texture Feature Extractor
 * Reads PNG/JPEG images from disk and computes texture variance, color metrics, and moisture sheen.
 */

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import jpeg from 'jpeg-js';

export class ImageParser {
  /**
   * Parse local image file and extract spectral & texture features
   * @param {String} filePath Absolute or relative path to image file
   * @returns {Object} { imageObj, spectralFeatures }
   */
  static parseImage(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const ext = path.extname(filePath).toLowerCase();
    const buffer = fs.readFileSync(filePath);
    let imageObj;

    if (ext === '.png') {
      const parsed = PNG.sync.read(buffer);
      imageObj = {
        width: parsed.width,
        height: parsed.height,
        data: parsed.data
      };
    } else if (ext === '.jpg' || ext === '.jpeg') {
      const parsed = jpeg.decode(buffer, { useTArray: true });
      imageObj = {
        width: parsed.width,
        height: parsed.height,
        data: parsed.data
      };
    } else {
      throw new Error(`Unsupported image format: ${ext}. Please use .png, .jpg, or .jpeg.`);
    }

    const spectralFeatures = this._extractFeatures(imageObj);

    return {
      imageObj,
      spectralFeatures
    };
  }

  /**
   * Extract vision & texture features from raw RGBA buffer
   */
  static _extractFeatures(imageObj) {
    const { width, height, data } = imageObj;
    const totalPixels = width * height;

    let sumR = 0, sumG = 0, sumB = 0;
    let luminanceList = new Float32Array(totalPixels);
    let sheenPixelCount = 0;

    for (let i = 0; i < totalPixels; i++) {
      const idx = i * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      sumR += r;
      sumG += g;
      sumB += b;

      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      luminanceList[i] = lum;

      // Specular glare / water sheen detection (high brightness, low color saturation)
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const sat = maxC === 0 ? 0 : (maxC - minC) / maxC;
      if (lum > 205 && sat < 0.25) {
        sheenPixelCount++;
      }
    }

    const meanR = Math.round(sumR / totalPixels);
    const meanG = Math.round(sumG / totalPixels);
    const meanB = Math.round(sumB / totalPixels);

    // Compute luminance mean & variance
    let lumSum = 0;
    for (let i = 0; i < totalPixels; i++) lumSum += luminanceList[i];
    const lumMean = lumSum / totalPixels;

    let varSum = 0;
    for (let i = 0; i < totalPixels; i++) {
      const diff = luminanceList[i] - lumMean;
      varSum += diff * diff;
    }
    const variance = Math.sqrt(varSum / totalPixels) / 128.0; // Normalized variance

    // Compute spatial edge density (high frequency neighbor differences)
    let edgeCount = 0;
    let neighborDiffSum = 0;
    let sampledPairs = 0;

    const step = Math.max(1, Math.floor(width / 200)); // Sample optimization for large images
    for (let y = 0; y < height - 1; y += step) {
      for (let x = 0; x < width - 1; x += step) {
        const idxCurrent = y * width + x;
        const idxRight = y * width + (x + 1);
        const idxDown = (y + 1) * width + x;

        const diffX = Math.abs(luminanceList[idxCurrent] - luminanceList[idxRight]);
        const diffY = Math.abs(luminanceList[idxCurrent] - luminanceList[idxDown]);

        neighborDiffSum += (diffX + diffY);
        sampledPairs += 2;

        if (diffX > 35 || diffY > 35) {
          edgeCount++;
        }
      }
    }

    const edgeDensity = Math.min(1.0, (edgeCount / (sampledPairs / 2)) * 1.5);
    const textureVariance = Math.min(1.0, variance * 0.7 + (neighborDiffSum / sampledPairs) / 64.0 * 0.3);
    const moistureSheen = Math.min(1.0, (sheenPixelCount / totalPixels) * 5.0);

    return {
      colorMean: [meanR, meanG, meanB],
      textureVariance: Number(textureVariance.toFixed(3)),
      moistureSheen: Number(moistureSheen.toFixed(3)),
      edgeDensity: Number(edgeDensity.toFixed(3))
    };
  }
}
