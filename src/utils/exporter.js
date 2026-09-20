/**
 * Report Exporter Module
 * Exports terrain perception and physical property analysis reports to JSON & CSV files.
 */

import fs from 'fs';
import path from 'path';

export class ReportExporter {
  static getExportDir() {
    const exportDir = path.resolve('exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    return exportDir;
  }

  /**
   * Export reports array to JSON file
   * @param {Array} reports Array of analysis report objects
   * @returns {String} File path written
   */
  static exportJSON(reports) {
    const exportDir = this.getExportDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `terrain_report_${timestamp}.json`;
    const filePath = path.join(exportDir, fileName);

    const payload = {
      system: "Vision-Based Deep Learning Terrain Recognition System",
      organisation: "Ministry of Defence (MoD)",
      generatedAt: new Date().toISOString(),
      reportCount: reports.length,
      reports
    };

    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
    return filePath;
  }

  /**
   * Export reports array to CSV file
   * @param {Array} reports Array of analysis report objects
   * @returns {String} File path written
   */
  static exportCSV(reports) {
    const exportDir = this.getExportDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `terrain_report_${timestamp}.csv`;
    const filePath = path.join(exportDir, fileName);

    const headers = [
      'SampleID',
      'SampleName',
      'Location',
      'PrimaryTerrain',
      'ConfidencePct',
      'RoughnessIndex',
      'RoughnessLevel',
      'SlipperinessIndex',
      'SlipperinessLevel',
      'FrictionCoefficient',
      'BearingCapacity',
      'TraversabilityScore',
      'TraversabilityRating',
      'HazardLevel',
      'MaxSpeedKmH',
      'TractionMode'
    ];

    const rows = reports.map(r => {
      const cls = r.classification;
      const phys = r.implicitProperties;
      const nav = r.navigationPerception;

      return [
        `"${r.sampleId}"`,
        `"${r.sampleName}"`,
        `"${r.location}"`,
        `"${cls.primary}"`,
        cls.confidence,
        phys.roughness.score,
        `"${phys.roughness.level}"`,
        phys.slipperiness.score,
        `"${phys.slipperiness.level}"`,
        phys.frictionCoefficient,
        `"${phys.bearingCapacity}"`,
        nav.traversabilityScore,
        `"${nav.traversabilityRating}"`,
        `"${nav.hazardLevel}"`,
        nav.maxSpeedKmH,
        `"${nav.tractionMode}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    fs.writeFileSync(filePath, csvContent, 'utf8');
    return filePath;
  }
}
