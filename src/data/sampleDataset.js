

export const SAMPLES = [
  {
    id: "SAMPLE-001",
    name: "Desolate Dune Sector A",
    groundTruth: "Sandy",
    location: "Sector 4-B (Arid Ground)",
    capturedAt: "2023-10-14 09:15:22 UTC",
    sensorResolution: "1920x1080",
    spectralFeatures: {
      colorMean: [210, 180, 130], // Sandy tan hue
      textureVariance: 0.18,      // Low texture bumpiness
      moistureSheen: 0.05,       // Dry surface
      edgeDensity: 0.12
    },
    description: "Fine granular sand dune area with low height variation and dry loose material."
  },
  {
    id: "SAMPLE-002",
    name: "Mountainous Ridge Pass",
    groundTruth: "Rocky",
    location: "Sector 9-F (High Elevation)",
    capturedAt: "2023-10-14 10:30:45 UTC",
    sensorResolution: "1920x1080",
    spectralFeatures: {
      colorMean: [110, 115, 120], // Slate grey stone
      textureVariance: 0.88,      // Extreme surface irregularity
      moistureSheen: 0.10,       // Dry rock
      edgeDensity: 0.91
    },
    description: "Aggressive rock terrain with high irregularity, loose boulders, and high surface roughness."
  },
  {
    id: "SAMPLE-003",
    name: "Field Sector Meadow",
    groundTruth: "Grass",
    location: "Sector 2-C (Plain Plateau)",
    capturedAt: "2023-10-14 11:42:10 UTC",
    sensorResolution: "1920x1080",
    spectralFeatures: {
      colorMean: [60, 140, 60],   // Vibrant green
      textureVariance: 0.42,      // Moderate vegetation texture
      moistureSheen: 0.25,       // Moderate vegetation moisture
      edgeDensity: 0.55
    },
    description: "Dense short vegetation cover over firm soil bed with good overall traction."
  },
  {
    id: "SAMPLE-004",
    name: "Riverbed Wetland Crossing",
    groundTruth: "Marshy",
    location: "Sector 7-D (Lowland Delta)",
    capturedAt: "2023-10-14 14:05:33 UTC",
    sensorResolution: "1920x1080",
    spectralFeatures: {
      colorMean: [85, 75, 55],    // Dark muddy brown/green
      textureVariance: 0.65,      // Uneven soft mud texture
      moistureSheen: 0.85,       // High water content / sheen
      edgeDensity: 0.38
    },
    description: "Saturated soil and mud with standing water layer, presenting extreme slipperiness and low bearing capacity."
  },
  {
    id: "SAMPLE-005",
    name: "Gravel Quarry Trail",
    groundTruth: "Rocky",
    location: "Sector 5-A (Industrial Corridor)",
    capturedAt: "2023-10-14 15:20:00 UTC",
    sensorResolution: "1920x1080",
    spectralFeatures: {
      colorMean: [140, 135, 130], // Grey/light brown gravel
      textureVariance: 0.72,      // High sharp gravel texture
      moistureSheen: 0.15,
      edgeDensity: 0.78
    },
    description: "Medium crushed stone surface with loose gravel overlay."
  },
  {
    id: "SAMPLE-006",
    name: "Wet Coastal Sand",
    groundTruth: "Sandy",
    location: "Sector 1-E (Tidal Zone)",
    capturedAt: "2023-10-14 16:10:12 UTC",
    sensorResolution: "1920x1080",
    spectralFeatures: {
      colorMean: [170, 150, 110], // Dark wet sand
      textureVariance: 0.25,
      moistureSheen: 0.70,       // High moisture film on sand
      edgeDensity: 0.20
    },
    description: "Saturated sand flat in littoral zone with increased slip probability due to water lubrication."
  }
];
