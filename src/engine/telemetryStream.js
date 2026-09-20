/**
 * Real-Time UGV Telemetry Stream & Camera Feed Simulator
 * Simulates real-time UGV field navigation, frame-by-frame ASCII camera feed, and perception telemetry.
 */

import readline from 'readline';
import chalk from 'chalk';
import boxen from 'boxen';
import { TerrainEngine } from './terrainEngine.js';
import { SAMPLES } from '../data/sampleDataset.js';

const engine = new TerrainEngine();

export class TelemetryStream {
  /**
   * Start live interactive UGV telemetry stream loop
   */
  static startLiveStream() {
    return new Promise((resolve) => {
      let frameCount = 0;
      let sampleIndex = 0;
      let isRunning = true;

      // Enable raw mode for single keypress exit detection ('q')
      const wasRaw = process.stdin.isRaw;
      if (process.stdin.setRawMode) {
        process.stdin.setRawMode(true);
      }
      process.stdin.resume();

      const keyHandler = (chunk) => {
        const str = chunk.toString();
        // Exit on 'q', Ctrl+C (\u0003), or Escape (\u001b)
        if (str === 'q' || str === 'Q' || str === '\u0003' || str === '\u001b') {
          cleanup();
        }
      };

      process.stdin.on('data', keyHandler);

      const cleanup = () => {
        if (!isRunning) return;
        isRunning = false;
        clearInterval(timer);
        process.stdin.removeListener('data', keyHandler);
        if (process.stdin.setRawMode) {
          process.stdin.setRawMode(wasRaw || false);
        }
        process.stdin.pause();
        console.clear();
        console.log(chalk.yellow.bold('\n[TELEMETRY] Live Camera Stream Stopped. Returning to Main Menu...\n'));
        setTimeout(resolve, 500);
      };

      // Animation & Telemetry Timer (updates every 350ms)
      const timer = setInterval(() => {
        if (!isRunning) return;

        frameCount++;
        if (frameCount % 12 === 0) {
          sampleIndex = (sampleIndex + 1) % SAMPLES.length;
        }

        const currentSample = SAMPLES[sampleIndex];
        
        // Add subtle dynamic noise to simulate real-time sensor fluctuation
        const jitteredSample = {
          ...currentSample,
          spectralFeatures: {
            ...currentSample.spectralFeatures,
            textureVariance: Math.min(1.0, Math.max(0.0, currentSample.spectralFeatures.textureVariance + (Math.random() - 0.5) * 0.08)),
            moistureSheen: Math.min(1.0, Math.max(0.0, currentSample.spectralFeatures.moistureSheen + (Math.random() - 0.5) * 0.08))
          }
        };

        const report = engine.analyze(jitteredSample);
        this._renderTelemetryHUD(frameCount, report);
      }, 350);
    });
  }

  /**
   * Render Live Telemetry Console HUD
   */
  static _renderTelemetryHUD(frameCount, report) {
    console.clear();

    const title = chalk.bgCyan.black.bold(` 📡 UGV TELEMETRY HUD | LIVE CAMERA STREAM [FRAME #${frameCount}] `);
    const exitPrompt = chalk.gray(' (Press ') + chalk.red.bold('q') + chalk.gray(' to stop stream) ');

    // Simulated camera ASCII frame animation
    const asciiFrame = this._generateAnimatedASCIIFrame(report.classification.primary, frameCount);
    
    const cls = report.classification;
    const phys = report.implicitProperties;
    const nav = report.navigationPerception;

    // Simulated dynamic vehicle metrics
    const simulatedSpeed = Math.max(5, nav.maxSpeedKmH + Math.round((Math.random() - 0.5) * 4));
    const wheelSlipPct = Math.round(phys.slipperiness.score * 45 + Math.random() * 5);
    const vibrationG = (phys.roughness.score * 1.8 + Math.random() * 0.2).toFixed(2);

    let hazardColor = chalk.green;
    if (nav.hazardLevel.includes('HIGH') || nav.hazardLevel.includes('HAZARD')) hazardColor = chalk.red;
    else if (nav.hazardLevel.includes('WARNING') || nav.hazardLevel.includes('CAUTION')) hazardColor = chalk.yellow;

    const hudText = `
${title} ${exitPrompt}

${asciiFrame}

${chalk.bold.yellow('--- DYNAMIC VEHICLE & SENSOR METRICS ---')}
${chalk.bold('Terrain Sector:')}    ${chalk.cyan.bold(report.location)}
${chalk.bold('CNN Classifier:')}    ${chalk.bgGreen.black.bold(` ${cls.primary} `)} (${cls.confidence}% confidence)
${chalk.bold('UGV Velocity:')}      ${chalk.bold.green(simulatedSpeed + ' km/h')} (Limit: ${nav.maxSpeedKmH} km/h)
${chalk.bold('Chassis Shock:')}     ${chalk.bold.magenta(vibrationG + ' G')} (Roughness R_i: ${phys.roughness.score})
${chalk.bold('Wheel Slip Rate:')}   ${wheelSlipPct > 20 ? chalk.red.bold(wheelSlipPct + '% [SLIP DETECTED]') : chalk.green(wheelSlipPct + '%')} (Slipperiness S_i: ${phys.slipperiness.score})
${chalk.bold('Friction Coef (μ):')} ${chalk.yellow(phys.frictionCoefficient)}
${chalk.bold('Traversability:')}    ${chalk.cyan(nav.traversabilityScore + '/100')} [${hazardColor(nav.hazardLevel)}]

${chalk.bold.yellow('--- TACTICAL DRIVE SYSTEM STATUS ---')}
${chalk.bold('Drive Mode:')}        ${chalk.yellow(nav.tractionMode)}
${chalk.bold('System Alert:')}      ${nav.warnings.length > 0 ? chalk.red(nav.warnings[0]) : chalk.green('All systems optimal.')}
`;

    console.log(boxen(hudText, {
      padding: 0,
      margin: 0,
      borderStyle: 'double',
      borderColor: nav.traversabilityScore < 50 ? 'red' : 'cyan'
    }));
  }

  /**
   * Generates dynamic ASCII landscape preview for live stream animation
   */
  static _generateAnimatedASCIIFrame(terrainType, frame) {
    const shift = frame % 6;
    let art = [];

    if (terrainType === 'Rocky') {
      art = [
        " /\\_  /\\     /\\   /\\_  /\\_    ",
        "/   \\/  \\_  /  \\_/   \\/   \\_  ",
        " /\\  /\\_  /\\ /\\_  /\\ /\\_  /\\_ "
      ];
    } else if (terrainType === 'Sandy') {
      art = [
        "~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ",
        "  ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ",
        "~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ "
      ];
    } else if (terrainType === 'Grass') {
      art = [
        "\\\\|/ \\\\|/ \\\\|/ \\|/ \\\\|/ \\\\|/  ",
        "|/|/ |/|/ |/|/ |/| |/|/ |/|/  ",
        "\\\\|/ \\\\|/ \\\\|/ \\|/ \\\\|/ \\\\|/  "
      ];
    } else { // Marshy
      art = [
        "approx. water level ~~~ ♒ ♒ ♒ ",
        "  ░░░▒▒▒░░░ mud delta ▒▒▒░░░ ",
        "♒ ♒ ~~~ standing water ~~~ ♒ "
      ];
    }

    // Scroll lines horizontally for live motion effect
    const scrolled = art.map(line => {
      const slicePos = shift % line.length;
      return line.slice(slicePos) + line.slice(0, slicePos);
    });

    return chalk.cyan(scrolled.join('\n'));
  }
}
