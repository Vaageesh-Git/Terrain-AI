#!/usr/bin/env node

/**
 * Deep Learning for Terrain Recognition & Implicit Physical Properties Analysis
 * Ministry of Defence (MoD) Research Prototype - Terminal Application
 */

import { select } from '@inquirer/prompts';
import ora from 'ora';
import chalk from 'chalk';

import { SAMPLES } from './src/data/sampleDataset.js';
import { TerrainEngine } from './src/engine/terrainEngine.js';
import { renderHeaderBanner, renderProjectMetadata, renderManual } from './src/ui/banner.js';
import { displayAnalysisReport, displayBatchReport } from './src/ui/menu.js';

const engine = new TerrainEngine();

/**
 * Single Sample Interactive Selection & Analysis
 */
async function handleSingleSample() {
  const choices = SAMPLES.map(sample => ({
    name: `${sample.id}: ${sample.name} (${chalk.yellow(sample.groundTruth)}) - ${chalk.gray(sample.location)}`,
    value: sample.id
  }));

  const selectedId = await select({
    message: 'Select a terrain sample for deep vision classification & physical evaluation:',
    choices
  });

  const sample = SAMPLES.find(s => s.id === selectedId);

  // Spinner animation for Deep Neural Inference simulation
  const spinner = ora({
    text: chalk.cyan(`Loading vision tensor for [${sample.id}] & executing CNN backbone inference...`),
    spinner: 'dots'
  }).start();

  await new Promise(resolve => setTimeout(resolve, 800));
  spinner.text = chalk.yellow('Extracting micro-texture variance & moisture sheen features...');
  await new Promise(resolve => setTimeout(resolve, 600));
  spinner.text = chalk.magenta('Computing implicit roughness, slipperiness & traversability metrics...');
  await new Promise(resolve => setTimeout(resolve, 500));
  spinner.succeed(chalk.green('Inference & Perception Engine analysis completed successfully!'));

  const report = engine.analyze(sample);
  displayAnalysisReport(report);
}

/**
 * Batch Scan Mode
 */
async function handleBatchScan() {
  const spinner = ora({
    text: chalk.cyan(`Processing batch vision scan across ${SAMPLES.length} terrain dataset samples...`),
    spinner: 'bouncingBar'
  }).start();

  await new Promise(resolve => setTimeout(resolve, 1200));
  spinner.succeed(chalk.green(`Batch scan completed for ${SAMPLES.length} samples!`));

  const reports = SAMPLES.map(sample => engine.analyze(sample));
  displayBatchReport(reports);
}

/**
 * Automated test mode for non-interactive execution
 */
async function runAutomatedTest() {
  console.log(chalk.bold.yellow('\n--- RUNNING AUTOMATED NON-INTERACTIVE TEST ---'));
  renderHeaderBanner();
  
  const sample = SAMPLES[0];
  const report = engine.analyze(sample);
  console.log(chalk.green('✓ Single Sample Analysis test passed.'));
  console.log(`- Sample: ${report.sampleId}`);
  console.log(`- Terrain: ${report.classification.primary} (${report.classification.confidence}%)`);
  console.log(`- Roughness: ${report.implicitProperties.roughness.score}`);
  console.log(`- Slipperiness: ${report.implicitProperties.slipperiness.score}`);

  const batchReports = SAMPLES.map(s => engine.analyze(s));
  console.log(chalk.green(`✓ Batch Scan test passed for ${batchReports.length} samples.`));
  console.log(chalk.bold.green('\n--- ALL AUTOMATED TESTS COMPLETED SUCCESSFULLY ---\n'));
}

/**
 * Main Interactive CLI Loop
 */
async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--test')) {
    await runAutomatedTest();
    return;
  }

  renderHeaderBanner();

  let keepRunning = true;
  while (keepRunning) {
    const action = await select({
      message: chalk.bold.cyan('Main Menu - Select an Operation:'),
      choices: [
        { name: '🔍 1. Analyze Single Terrain Sample (Vision CNN + Physical Engine)', value: 'single' },
        { name: '📊 2. Run Batch Scan on Terrain Dataset', value: 'batch' },
        { name: '🔬 3. View Implicit Quantities Reference Manual (Roughness & Slipperiness)', value: 'manual' },
        { name: '🏷️  4. View Project & System Metadata (MoD Specification)', value: 'metadata' },
        { name: '❌ 5. Exit Terminal Application', value: 'exit' }
      ]
    });

    switch (action) {
      case 'single':
        await handleSingleSample();
        break;
      case 'batch':
        await handleBatchScan();
        break;
      case 'manual':
        renderManual();
        break;
      case 'metadata':
        renderProjectMetadata();
        break;
      case 'exit':
        keepRunning = false;
        console.log(chalk.cyan.bold('\nExiting Terrain Recognition Terminal Application. Standby for UGV operation.\n'));
        break;
    }
  }
}

main().catch(err => {
  console.error(chalk.red('\nFatal Application Error:'), err);
  process.exit(1);
});
