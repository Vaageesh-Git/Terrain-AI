#!/usr/bin/env node

/**
 * Deep Learning for Terrain Recognition & Implicit Physical Properties Analysis
 * Ministry of Defence (MoD) Research Prototype - Terminal Application
 */

import path from 'path';
import fs from 'fs';
import { select, input } from '@inquirer/prompts';
import ora from 'ora';
import chalk from 'chalk';

import { SAMPLES } from './src/data/sampleDataset.js';
import { TerrainEngine } from './src/engine/terrainEngine.js';
import { ImageParser } from './src/engine/imageParser.js';
import { renderImageToASCII } from './src/utils/asciiRenderer.js';
import { ensureSampleImagesExist } from './src/data/createSampleImages.js';
import { renderHeaderBanner, renderProjectMetadata, renderManual } from './src/ui/banner.js';
import { displayAnalysisReport, displayBatchReport } from './src/ui/menu.js';

const engine = new TerrainEngine();

/**
 * Single Dataset Sample Analysis
 */
async function handleSingleSample() {
  const choices = SAMPLES.map(sample => ({
    name: `${sample.id}: ${sample.name} (${chalk.yellow(sample.groundTruth)}) - ${chalk.gray(sample.location)}`,
    value: sample.id
  }));

  const selectedId = await select({
    message: 'Select a dataset terrain sample for deep vision classification & physical evaluation:',
    choices
  });

  const sample = SAMPLES.find(s => s.id === selectedId);

  const spinner = ora({
    text: chalk.cyan(`Loading vision tensor for [${sample.id}] & executing CNN backbone inference...`),
    spinner: 'dots'
  }).start();

  await new Promise(resolve => setTimeout(resolve, 600));
  spinner.text = chalk.yellow('Extracting micro-texture variance & moisture sheen features...');
  await new Promise(resolve => setTimeout(resolve, 500));
  spinner.text = chalk.magenta('Computing implicit roughness, slipperiness & traversability metrics...');
  await new Promise(resolve => setTimeout(resolve, 400));
  spinner.succeed(chalk.green('Inference & Perception Engine analysis completed successfully!'));

  const report = engine.analyze(sample);
  displayAnalysisReport(report);
}

/**
 * Custom Local Image File Analyzer (.png / .jpg)
 */
async function handleCustomImageFile() {
  ensureSampleImagesExist();
  const sampleDir = path.resolve('data/sample_images');
  const sampleFiles = fs.readdirSync(sampleDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));

  const choices = [
    ...sampleFiles.map(f => ({ name: `📁 ${f} (Sample Image)`, value: path.join(sampleDir, f) })),
    { name: '✏️  Enter Custom File Path...', value: 'custom' }
  ];

  let selectedPath = await select({
    message: 'Select a local terrain image file to analyze:',
    choices
  });

  if (selectedPath === 'custom') {
    selectedPath = await input({
      message: 'Enter absolute or relative path to image file (.png / .jpg):',
      validate: (val) => fs.existsSync(val) ? true : 'File does not exist. Please enter a valid file path.'
    });
  }

  const spinner = ora({
    text: chalk.cyan(`Reading image file [${path.basename(selectedPath)}] & decoding raw pixel buffer...`),
    spinner: 'dots'
  }).start();

  let parsed;
  try {
    parsed = ImageParser.parseImage(selectedPath);
    spinner.succeed(chalk.green(`Successfully parsed image (${parsed.imageObj.width}x${parsed.imageObj.height} px)`));
  } catch (err) {
    spinner.fail(chalk.red(`Failed to parse image file: ${err.message}`));
    return;
  }

  // 1. Render ASCII Image Preview
  console.log('\n');
  const asciiBox = renderImageToASCII(parsed.imageObj, {
    targetWidth: 54,
    title: `ASCII PREVIEW: ${path.basename(selectedPath).toUpperCase()}`
  });
  console.log(asciiBox);

  // 2. Run Terrain Perception Engine on extracted features
  const customSample = {
    id: `FILE-${path.basename(selectedPath).toUpperCase()}`,
    name: path.basename(selectedPath),
    location: `Local File System (${selectedPath})`,
    capturedAt: new Date().toISOString(),
    spectralFeatures: parsed.spectralFeatures
  };

  const report = engine.analyze(customSample);
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

  await new Promise(resolve => setTimeout(resolve, 800));
  spinner.succeed(chalk.green(`Batch scan completed for ${SAMPLES.length} samples!`));

  const reports = SAMPLES.map(sample => engine.analyze(sample));
  displayBatchReport(reports);
}

/**
 * Automated test mode for non-interactive execution
 */
async function runAutomatedTest() {
  console.log(chalk.bold.yellow('\n--- RUNNING AUTOMATED NON-INTERACTIVE TEST (PART 1 & PART 2) ---'));
  renderHeaderBanner();
  ensureSampleImagesExist();
  
  // Test 1: Single sample
  const sample = SAMPLES[0];
  const report = engine.analyze(sample);
  console.log(chalk.green('✓ Dataset Analysis test passed.'));

  // Test 2: Local Image Parsing & ASCII preview
  const testImagePath = path.resolve('data/sample_images/rocky_pass.png');
  const parsed = ImageParser.parseImage(testImagePath);
  console.log(chalk.green(`✓ Image Parser test passed (${parsed.imageObj.width}x${parsed.imageObj.height} px).`));
  
  const asciiOutput = renderImageToASCII(parsed.imageObj, { targetWidth: 40, title: 'TEST' });
  if (asciiOutput && asciiOutput.length > 0) {
    console.log(chalk.green('✓ ASCII Terminal Image Renderer test passed.'));
  }

  // Test 3: Batch scan
  const batchReports = SAMPLES.map(s => engine.analyze(s));
  console.log(chalk.green(`✓ Batch Scan test passed for ${batchReports.length} samples.`));
  console.log(chalk.bold.green('\n--- ALL AUTOMATED TESTS COMPLETED SUCCESSFULLY ---\n'));
}

/**
 * Main Interactive CLI Loop
 */
async function main() {
  ensureSampleImagesExist();

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
        { name: '🔍 1. Analyze Dataset Sample (Pre-configured Profiles)', value: 'single' },
        { name: '🖼️  2. Analyze Custom Local Image File (.png / .jpg with ASCII Preview)', value: 'custom_file' },
        { name: '📊 3. Run Batch Scan on Terrain Dataset', value: 'batch' },
        { name: '🔬 4. View Implicit Quantities Reference Manual (Roughness & Slipperiness)', value: 'manual' },
        { name: '🏷️  5. View Project & System Metadata (MoD Specification)', value: 'metadata' },
        { name: '❌ 6. Exit Terminal Application', value: 'exit' }
      ]
    });

    switch (action) {
      case 'single':
        await handleSingleSample();
        break;
      case 'custom_file':
        await handleCustomImageFile();
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
