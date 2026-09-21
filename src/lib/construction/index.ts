/**
 * Materials estimating and the small amount of physics the engineering
 * calculators need.
 *
 * Everything works in the units it is given. A trade calculator that silently
 * converted would be worse than useless on a site where the visitor's country
 * decides whether they think in metres or feet.
 */

/* ---------------------------------------------------------------- materials */

/** Adds a waste allowance, which every trade orders and no formula includes. */
export function withWaste(quantity: number, wastePercent: number): number {
  return quantity * (1 + wastePercent / 100);
}

export type ConcreteEstimate = {
  volume: number;
  volumeWithWaste: number;
  bags: number;
  /** Rough constituent split at the given mix ratio. */
  cement: number;
  sand: number;
  aggregate: number;
};

/**
 * Concrete for a slab or footing.
 *
 * The mix ratio is given as parts cement : sand : aggregate, which is how it
 * is specified on site - 1:2:4 for general work, 1:1.5:3 for structural.
 */
export function concrete({
  length,
  width,
  thickness,
  wastePercent = 10,
  bagYield,
  mix = [1, 2, 4],
}: {
  length: number;
  width: number;
  thickness: number;
  wastePercent?: number;
  /** Volume one bag of mixed concrete produces, in the same units. */
  bagYield: number;
  mix?: [number, number, number];
}): ConcreteEstimate {
  const volume = length * width * thickness;
  const volumeWithWaste = withWaste(volume, wastePercent);

  const parts = mix[0] + mix[1] + mix[2];
  // Dry materials occupy roughly 1.54 times the wet volume once voids are
  // filled; it is the standard site allowance rather than an exact constant.
  const dry = volumeWithWaste * 1.54;

  return {
    volume,
    volumeWithWaste,
    bags: bagYield > 0 ? volumeWithWaste / bagYield : 0,
    cement: (dry * mix[0]) / parts,
    sand: (dry * mix[1]) / parts,
    aggregate: (dry * mix[2]) / parts,
  };
}

export type PaintEstimate = {
  paintableArea: number;
  totalArea: number;
  litres: number;
  litresPerCoat: number;
};

/** Paint for a room, allowing for doors and windows and more than one coat. */
export function paint({
  perimeter,
  height,
  coats = 2,
  coveragePerLitre,
  openings = 0,
}: {
  perimeter: number;
  height: number;
  coats?: number;
  /** Area one litre covers in a single coat. */
  coveragePerLitre: number;
  /** Total area of doors and windows to subtract. */
  openings?: number;
}): PaintEstimate {
  const totalArea = perimeter * height;
  const paintableArea = Math.max(totalArea - openings, 0);
  const litresPerCoat = coveragePerLitre > 0 ? paintableArea / coveragePerLitre : 0;

  return {
    totalArea,
    paintableArea,
    litresPerCoat,
    litres: litresPerCoat * Math.max(coats, 1),
  };
}

export type TileEstimate = {
  area: number;
  tileArea: number;
  tilesExact: number;
  tiles: number;
  boxes: number;
};

/** Tiles for a floor or wall, with a waste allowance for cuts and breakages. */
export function tiles({
  areaLength,
  areaWidth,
  tileLength,
  tileWidth,
  wastePercent = 10,
  perBox = 0,
}: {
  areaLength: number;
  areaWidth: number;
  /** Tile dimensions in the same units as the area. */
  tileLength: number;
  tileWidth: number;
  wastePercent?: number;
  perBox?: number;
}): TileEstimate {
  const area = areaLength * areaWidth;
  const tileArea = tileLength * tileWidth;

  if (tileArea <= 0) {
    return { area, tileArea: 0, tilesExact: 0, tiles: 0, boxes: 0 };
  }

  const tilesExact = area / tileArea;
  // Tiles are bought whole, and the waste allowance is what covers the cuts.
  const needed = Math.ceil(withWaste(tilesExact, wastePercent));

  return {
    area,
    tileArea,
    tilesExact,
    tiles: needed,
    boxes: perBox > 0 ? Math.ceil(needed / perBox) : 0,
  };
}

/**
 * Roof surface area from its footprint and its pitch.
 *
 * A pitched roof is larger than the building beneath it by a factor that
 * depends only on the slope: √(1 + (rise/run)²). A 6:12 roof is about 12%
 * larger than its footprint, which is the part people forget when ordering.
 */
export function roofArea({
  footprintLength,
  footprintWidth,
  rise,
  run = 12,
}: {
  footprintLength: number;
  footprintWidth: number;
  /** Vertical rise per unit of horizontal run. */
  rise: number;
  run?: number;
}): { footprint: number; factor: number; area: number; pitchDegrees: number } {
  const footprint = footprintLength * footprintWidth;
  const slope = run === 0 ? 0 : rise / run;
  const factor = Math.sqrt(1 + slope * slope);

  return {
    footprint,
    factor,
    area: footprint * factor,
    pitchDegrees: (Math.atan(slope) * 180) / Math.PI,
  };
}

/* ------------------------------------------------------------------ physics */

export type OhmsLaw = { volts: number; amps: number; ohms: number; watts: number };

/**
 * Ohm's law plus power, solved from whichever pair you know.
 *
 * V = IR and P = VI are the whole of it; every other form is a rearrangement,
 * which is why a solver beats four separate calculators.
 */
export function ohmsLaw(
  known: "vi" | "vr" | "ir" | "pv" | "pi" | "pr",
  a: number,
  b: number,
): OhmsLaw {
  let volts = 0;
  let amps = 0;
  let ohms = 0;

  switch (known) {
    case "vi":
      volts = a;
      amps = b;
      ohms = amps === 0 ? 0 : volts / amps;
      break;
    case "vr":
      volts = a;
      ohms = b;
      amps = ohms === 0 ? 0 : volts / ohms;
      break;
    case "ir":
      amps = a;
      ohms = b;
      volts = amps * ohms;
      break;
    case "pv":
      volts = b;
      amps = volts === 0 ? 0 : a / volts;
      ohms = amps === 0 ? 0 : volts / amps;
      break;
    case "pi":
      amps = b;
      volts = amps === 0 ? 0 : a / amps;
      ohms = amps === 0 ? 0 : volts / amps;
      break;
    case "pr":
      ohms = b;
      // P = I²R, so I = √(P/R).
      amps = ohms <= 0 ? 0 : Math.sqrt(a / ohms);
      volts = amps * ohms;
      break;
  }

  return { volts, amps, ohms, watts: volts * amps };
}

export const GRAVITY = 9.80665;

/** Newton's second law, with the weight the same mass has under gravity. */
export function force(mass: number, acceleration: number) {
  return {
    force: mass * acceleration,
    weight: mass * GRAVITY,
    /** Momentum-free work done over one metre, for context. */
    energyPerMetre: mass * acceleration,
  };
}

/** Torque from a force applied at a distance, optionally off-axis. */
export function torque(
  appliedForce: number,
  radius: number,
  angleDegrees = 90,
): { torque: number; effectiveForce: number } {
  const radians = (angleDegrees * Math.PI) / 180;
  const effectiveForce = appliedForce * Math.sin(radians);
  return { torque: effectiveForce * radius, effectiveForce };
}
