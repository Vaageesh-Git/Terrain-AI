/**
 * Results Renderer & Table Dashboards
 */

import chalk from 'chalk';
import Table from 'cli-table3';
import boxen from 'boxen';

/**
 * Render visual progress bar gauge
 */
function renderGauge(score, max = 100, length = 20) {
  const percent = Math.min(1.0, Math.max(0.0, score / max));
  const filledLength = Math.round(length * percent);
  const emptyLength = length - filledLength;

  let colorFn = chalk.green;
  if (percent > 0.75) colorFn = chalk.red;
  else if (percent > 0.5) colorFn = chalk.hex('#FFA500'); // Orange
  else if (percent > 0.3) colorFn = chalk.yellow;

  const bar = colorFn('█'.repeat(filledLength)) + chalk.gray('░'.repeat(emptyLength));
  return `${bar} ${Math.round(percent * 100)}%`;
}

/**
 * Render complete Single Sample Analysis Dashboard
 */
export function displayAnalysisReport(report) {
  console.log('\n' + chalk.bold.cyan(`===== TERRAIN RECOGNITION & PERCEPTION REPORT [${report.sampleId}] =====`));

  // Meta Table
  const metaTable = new Table({
    head: [chalk.cyan('Sample Name'), chalk.cyan('Location'), chalk.cyan('Captured Timestamp')],
    colWidths: [30, 25, 30]
  });
  metaTable.push([report.sampleName, report.location, report.timestamp]);
  console.log(metaTable.toString());

  // Classification & Probabilities
  console.log('\n' + chalk.bold.yellow('1. CNN TERRAIN CLASSIFICATION RESULTS'));
  const classTable = new Table({
    head: [chalk.yellow('Predicted Class'), chalk.yellow('Confidence'), chalk.yellow('Probability Distribution')],
    colWidths: [20, 15, 50]
  });

  const probs = report.classification.probabilities;
  const distStr = `Sandy: ${probs.Sandy}% | Rocky: ${probs.Rocky}% | Grass: ${probs.Grass}% | Marshy: ${probs.Marshy}%`;
  
  let primaryBadge = chalk.bgGreen.black.bold(` ${report.classification.primary} `);
  if (report.classification.primary === 'Marshy') primaryBadge = chalk.bgRed.white.bold(` ${report.classification.primary} `);
  if (report.classification.primary === 'Rocky') primaryBadge = chalk.bgYellow.black.bold(` ${report.classification.primary} `);

  classTable.push([
    primaryBadge,
    chalk.green.bold(`${report.classification.confidence}%`),
    distStr
  ]);
  console.log(classTable.toString());

  // Implicit Physical Quantities
  console.log('\n' + chalk.bold.yellow('2. IMPLICIT PHYSICAL QUANTITIES ESTIMATION'));
  const physTable = new Table({
    head: [chalk.yellow('Property'), chalk.yellow('Score / Value'), chalk.yellow('Level / Status'), chalk.yellow('Description')],
    colWidths: [24, 18, 28, 45]
  });

  const r = report.implicitProperties.roughness;
  const s = report.implicitProperties.slipperiness;

  physTable.push(
    [
      chalk.bold('Roughness Index (R_i)'),
      `${r.score} / 1.0`,
      chalk.cyan(r.level),
      r.description
    ],
    [
      chalk.bold('Slipperiness Index (S_i)'),
      `${s.score} / 1.0`,
      chalk.magenta(s.level),
      s.description
    ],
    [
      chalk.bold('Friction Coef (μ)'),
      chalk.green.bold(report.implicitProperties.frictionCoefficient),
      'Dynamic Estimation',
      'Surface material contact friction coefficient'
    ],
    [
      chalk.bold('Bearing Capacity'),
      'N/A',
      chalk.blue(report.implicitProperties.bearingCapacity),
      'Soil compaction & structural support estimate'
    ]
  );
  console.log(physTable.toString());

  // UGV Navigation Perception Card
  console.log('\n' + chalk.bold.yellow('3. UGV ENVIRONMENT PERCEPTION & TACTICAL GUIDELINES'));
  const nav = report.navigationPerception;

  let hazardBadge = chalk.bgGreen.black.bold(` ${nav.hazardLevel} `);
  if (nav.hazardLevel.includes('HIGH') || nav.hazardLevel.includes('HAZARD')) {
    hazardBadge = chalk.bgRed.white.bold(` ${nav.hazardLevel} `);
  } else if (nav.hazardLevel.includes('WARNING') || nav.hazardLevel.includes('CAUTION')) {
    hazardBadge = chalk.bgYellow.black.bold(` ${nav.hazardLevel} `);
  }

  const warningsText = nav.warnings.length > 0 
    ? nav.warnings.map(w => chalk.red(`• ${w}`)).join('\n')
    : chalk.green('• No immediate physical hazards detected.');

  const navBoxContent = `
${chalk.bold('Traversability Index:')}  ${renderGauge(nav.traversabilityScore)} (${nav.traversabilityScore}/100 - ${chalk.cyan(nav.traversabilityRating)})
${chalk.bold('Hazard Assessment:')}    ${hazardBadge}
${chalk.bold('Max Speed Limit:')}      ${chalk.bold.green(nav.maxSpeedKmH + ' km/h')}
${chalk.bold('Traction Control:')}     ${chalk.bold.yellow(nav.tractionMode)}

${chalk.bold('System Alerts:')}
${warningsText}
`;

  console.log(boxen(navBoxContent, {
    padding: 1,
    borderStyle: 'round',
    borderColor: nav.traversabilityScore < 50 ? 'red' : 'cyan'
  }));
}

/**
 * Render Batch Scan Table
 */
export function displayBatchReport(reports) {
  console.log('\n' + chalk.bold.cyan('=================== BATCH TERRAIN RECOGNITION SCAN ==================='));
  
  const batchTable = new Table({
    head: [
      chalk.cyan('Sample ID'),
      chalk.cyan('Terrain'),
      chalk.cyan('Conf.'),
      chalk.cyan('Roughness R_i'),
      chalk.cyan('Slipperiness S_i'),
      chalk.cyan('Friction μ'),
      chalk.cyan('Traversability'),
      chalk.cyan('Rec. Speed')
    ]
  });

  reports.forEach(rep => {
    batchTable.push([
      rep.sampleId,
      chalk.bold(rep.classification.primary),
      `${rep.classification.confidence}%`,
      `${rep.implicitProperties.roughness.score} (${rep.implicitProperties.roughness.level})`,
      `${rep.implicitProperties.slipperiness.score}`,
      `${rep.implicitProperties.frictionCoefficient}`,
      `${rep.navigationPerception.traversabilityScore}/100`,
      `${rep.navigationPerception.maxSpeedKmH} km/h`
    ]);
  });

  console.log(batchTable.toString());
  console.log(chalk.gray(`Batch execution completed for ${reports.length} samples.\n`));
}
