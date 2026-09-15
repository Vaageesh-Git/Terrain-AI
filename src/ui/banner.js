/**
 * Terminal UI Banners & Metadata Formatting
 */

import chalk from 'chalk';
import boxen from 'boxen';
import figlet from 'figlet';

export function renderHeaderBanner() {
  const titleText = figlet.textSync('TERRAIN-AI', { font: 'Standard' });
  const asciiTitle = chalk.cyan.bold(titleText);

  const subHeader = chalk.yellow.bold("DEEP LEARNING TERRAIN RECOGNITION & IMPLICIT PHYSICAL ESTIMATION");
  const modTag = chalk.bgRed.white.bold(" MINISTRY OF DEFENCE | RESEARCH PROJECT (2023) ");

  const content = `${asciiTitle}\n${subHeader}\n${modTag}`;

  console.log(boxen(content, {
    padding: 1,
    margin: 1,
    borderStyle: 'double',
    borderColor: 'cyan',
    align: 'center'
  }));
}

export function renderProjectMetadata() {
  const metaText = `
${chalk.bold.cyan("PROJECT METADATA & SPECIFICATION (MoD 2023)")}
---------------------------------------------------
${chalk.gray("Title:")}           Vision-Based Deep Learning for Terrain Recognition
${chalk.gray("Implicit Info:")}   Surface Roughness ($R_i$), Slipperiness ($S_i$), Friction ($\mu$)
${chalk.gray("Target Classes:")}  Sandy | Rocky | Grass | Marshy
${chalk.gray("Year:")}            2023
${chalk.gray("Category:")}        Software (SW)
${chalk.gray("Domain Bucket:")}   Miscellaneous / Autonomous UGV Environment Perception
${chalk.gray("Organisation:")}    Ministry of Defence (MoD)

${chalk.bold.yellow("KEY TECHNICAL HIGHLIGHTS:")}
1. ${chalk.green("Multi-Head Neural Classifier:")} Vision-based CNN softmax inference for terrain type.
2. ${chalk.green("Implicit Physical Quantities:")} Estimation of roughness & slipperiness from micro-texture variance & moisture sheen.
3. ${chalk.green("UGV Perception Engine:")} Automated calculation of safe speed limits, friction coefficient, and hazard alerts.
`;

  console.log(boxen(metaText, {
    padding: 1,
    borderStyle: 'round',
    borderColor: 'yellow'
  }));
}

export function renderManual() {
  const manualContent = `
${chalk.bold.cyan("IMPLICIT PHYSICAL QUANTITIES REFERENCE MANUAL")}
---------------------------------------------------

${chalk.bold.yellow("1. SURFACE ROUGHNESS INDEX (R_i ∈ [0.0, 1.0])")}
Measures surface micro-geometry irregularity, elevation variance, and micro-texture bumpiness.
  • ${chalk.green("0.00 - 0.25 (Smooth):")} Flat road, fine sand, trimmed vegetation.
  • ${chalk.yellow("0.25 - 0.50 (Moderate):")} Small pebbles, uneven field, light gravel.
  • ${chalk.keyword('orange')("0.50 - 0.75 (Rough):")} Broken rock, heavy gravel, deep ruts.
  • ${chalk.red("0.75 - 1.00 (Extremely Rough):")} Boulders, jagged rock face, extreme vibration hazard.

${chalk.bold.yellow("2. SLIPPERINESS INDEX (S_i ∈ [0.0, 1.0]) & FRICTION (μ)")}
Estimates surface adhesion, moisture sheen, mud saturation, and dynamic traction reduction.
  • ${chalk.green("0.00 - 0.25 (Firm Traction / μ ≈ 0.65 - 0.85):")} Dry rock, dry compact soil.
  • ${chalk.yellow("0.25 - 0.50 (Moderate Slip / μ ≈ 0.45 - 0.60):")} Wet grass, loose dry sand.
  • ${chalk.keyword('orange')("0.50 - 0.75 (High Slip / μ ≈ 0.25 - 0.40):")} Muddy slope, wet algae rock.
  • ${chalk.red("0.75 - 1.00 (Severe / Hydroplaning / μ < 0.25):")} Marshy delta, deep mud, water film.

${chalk.bold.yellow("3. TRAVERSABILITY SCORE (T ∈ [0, 100])")}
Integrated safety index combining classification confidence, roughness penalty, slip risk, and chassis clearance constraints.
`;

  console.log(boxen(manualContent, {
    padding: 1,
    borderStyle: 'round',
    borderColor: 'green'
  }));
}
