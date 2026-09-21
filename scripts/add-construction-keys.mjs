/** English copy for the Construction and Engineering calculator sets. */
import { readFileSync, writeFileSync } from "node:fs";

const PATH = "src/lib/i18n/dictionaries/en.json";
const dict = JSON.parse(readFileSync(PATH, "utf8"));

Object.assign(dict, {
  "units.watts": "W",
  "units.volts": "V",
  "units.amps": "A",
  "units.ohms": "Ω",
  "units.newtons": "N",
  "units.newtonMetres": "N·m",
  "field.wasteAllowance": "Waste allowance",

  // --------------------------------------------------------------- concrete
  "calc.concrete.title": "Concrete Calculator",
  "calc.concrete.desc": "Concrete volume for a slab or footing, with bags and the mix breakdown.",
  "field.slabLength": "Length",
  "field.slabWidth": "Width",
  "field.slabThickness": "Thickness",
  "calc.concrete.thicknessHint": "In the same units as length and width — 0.1 m, or 0.33 ft for 4 inches.",
  "field.concreteMix": "Mix ratio",
  "mix.general": "1 : 2 : 4 — general use",
  "mix.structural": "1 : 1.5 : 3 — structural",
  "mix.foundation": "1 : 3 : 6 — foundations",
  "field.bagYield": "Volume per bag",
  "calc.concrete.bagHint": "What one bag makes up — roughly 0.011 m³ for a 25 kg bag, or 0.375 ft³ for an 80 lb bag.",
  "result.concreteVolume": "Concrete needed",
  "result.bagsNeeded": "Bags needed",
  "result.volumeBeforeWaste": "Volume before waste",
  "result.cementPart": "Cement",
  "result.sandPart": "Sand",
  "result.aggregatePart": "Aggregate",
  "calc.concrete.note":
    "Units are whatever you entered — metres in, cubic metres out. The constituent split uses the standard 1.54 dry-volume allowance and is an estimate for ordering, not a mix design.",
  "calc.concrete.explain.1":
    "Volume is length × width × thickness, plus a waste allowance for spillage, uneven ground and over-dig. Ten per cent is the usual figure; more on rough ground.",
  "calc.concrete.explain.2":
    "Dry materials take up about 1.54 times the finished wet volume, because the sand and cement fill the voids between the aggregate. The parts are then split by the mix ratio.",
  "calc.concrete.faq.1.q": "Should I order by bag or by truck?",
  "calc.concrete.faq.1.a":
    "Bags are practical up to roughly a cubic metre. Beyond that, ready-mix is cheaper, far quicker and more consistent — and a large slab poured in bag-sized batches risks cold joints.",
  "calc.concrete.faq.2.q": "What does the mix ratio mean?",
  "calc.concrete.faq.2.a":
    "Parts by volume of cement, sand and aggregate. 1:2:4 is the general-purpose mix for paths and bases; 1:1.5:3 is stronger for structural work; 1:3:6 is weaker and used for mass fill.",

  // ------------------------------------------------------------------ paint
  "calc.paint.title": "Paint Calculator",
  "calc.paint.desc": "How much paint a room needs, allowing for doors, windows and coats.",
  "field.roomPerimeter": "Room perimeter",
  "calc.paint.perimeterHint": "Add up all four walls — for a 5 × 4 room that is 18.",
  "field.wallHeight": "Wall height",
  "field.openingsArea": "Doors and windows",
  "calc.paint.openingsHint": "Their total area, to subtract. A standard door is about 1.8 m².",
  "field.coats": "Coats",
  "field.coveragePerLitre": "Coverage per litre",
  "calc.paint.coverageHint": "From the tin — usually 10–14 m² per litre, or around 350 sq ft per gallon.",
  "result.paintNeeded": "Paint needed",
  "result.paintableArea": "Paintable area",
  "result.perCoat": "Per coat",
  "result.wallAreaTotal": "Total wall area",
  "calc.paint.note":
    "Coverage falls on porous or previously unpainted surfaces, and a strong colour change may need an extra coat. Buying slightly over is usually cheaper than a second trip for a part-tin.",
  "calc.paint.explain.1":
    "Wall area is the perimeter multiplied by the height. Subtract the doors and windows, divide by the coverage on the tin, and multiply by the number of coats.",
  "calc.paint.explain.2":
    "Perimeter rather than floor area is what matters, which is why two rooms of the same floor area can need different amounts: a long narrow room has more wall than a square one.",
  "calc.paint.faq.1.q": "Do I need to subtract doors and windows?",
  "calc.paint.faq.1.a":
    "In a small room, yes — a door and a window can easily be 15% of the wall. In a large room the difference is within the rounding, and leaving them in buys you a margin.",
  "calc.paint.faq.2.q": "How many coats?",
  "calc.paint.faq.2.a":
    "Two over a similar colour. Three when going light over dark, or onto bare plaster, where the first coat is mostly absorbed. A primer or mist coat on new plaster is cheaper than an extra topcoat.",

  // ------------------------------------------------------------------- tile
  "calc.tile.title": "Tile Calculator",
  "calc.tile.desc": "Tiles and boxes needed for a floor or wall, including cutting waste.",
  "field.areaLength": "Area length",
  "field.areaWidth": "Area width",
  "field.tileLength": "Tile length",
  "calc.tile.tileHint": "In the same units as the area — a 60 cm tile is 0.6 m.",
  "field.tileWidth": "Tile width",
  "calc.tile.wasteHint": "10% for a simple layout, 15% or more for diagonals and awkward rooms.",
  "field.tilesPerBox": "Tiles per box",
  "result.tilesNeeded": "Tiles needed",
  "result.boxesNeeded": "Boxes needed",
  "result.areaToCover": "Area to cover",
  "result.tilesBeforeWaste": "Tiles before waste",
  "calc.tile.note":
    "Both tiles and boxes are rounded up, because neither is sold in parts. Buying a spare box from the same batch is worth it — dye lots differ, and a cracked tile in two years is otherwise unmatchable.",
  "calc.tile.explain.1":
    "Divide the area to cover by the area of one tile, then add the waste allowance for cuts, breakages and the offcuts that are too small to use.",
  "calc.tile.explain.2":
    "The allowance matters more than it looks. A straight layout in a square room wastes little; a diagonal layout, or a room with alcoves, can waste 15–20% in cuts alone.",
  "calc.tile.faq.1.q": "Does grout spacing change the count?",
  "calc.tile.faq.1.a":
    "Slightly, and in your favour — the joints mean each tile covers marginally more than its own size. It is well inside the waste allowance, so it is not worth modelling.",
  "calc.tile.faq.2.q": "How much waste should I allow?",
  "calc.tile.faq.2.a":
    "10% for a straightforward rectangular room with a simple grid. 15% for diagonal or herringbone layouts, large-format tiles, or rooms with lots of corners and obstacles.",

  // --------------------------------------------------------------- roof area
  "calc.roof.title": "Roof Area Calculator",
  "calc.roof.desc": "The true surface area of a pitched roof, which is larger than its footprint.",
  "field.buildingLength": "Building length",
  "field.buildingWidth": "Building width",
  "field.roofRise": "Rise per 12 of run",
  "calc.roof.pitchHint": "A 6:12 roof rises 6 for every 12 across. Enter 6.",
  "field.roofOverhang": "Eaves overhang",
  "result.roofArea": "Roof surface area",
  "result.footprint": "Footprint covered",
  "result.pitchFactor": "Pitch factor",
  "result.pitchDegrees": "Pitch angle",
  "result.roofingSquares": "Roofing squares",
  "calc.roof.squaresHint": "Only meaningful if you measured in feet: a square is 100 sq ft.",
  "calc.roof.note":
    "This covers a simple gable roof. Hips, valleys, dormers and chimneys all change the area, and each one adds cutting waste on top.",
  "calc.roof.explain.1":
    "A sloped surface is longer than the ground it covers by √(1 + (rise/run)²). That is the pitch factor, and multiplying the footprint by it gives the real area to cover.",
  "calc.roof.explain.2":
    "A 6:12 roof has a factor of about 1.118, so it is nearly 12% larger than the building beneath it. Ordering to the footprint is the classic way to come up a pallet short.",
  "calc.roof.faq.1.q": "How do I find my roof pitch without climbing up?",
  "calc.roof.faq.1.a":
    "Hold a level horizontally against the rake from inside the loft, mark 12 units along it, and measure straight down to the rafter. That drop is the rise per 12 of run.",
  "calc.roof.faq.2.q": "Does the overhang really matter?",
  "calc.roof.faq.2.a":
    "Yes. A 300 mm overhang on a 12 × 8 m building adds over 12 m² to the footprint before the pitch factor is even applied, because it runs around all four sides.",

  // --------------------------------------------------------------- ohms law
  "calc.ohms.title": "Ohm's Law Calculator",
  "calc.ohms.desc": "Voltage, current, resistance and power, solved from any two of them.",
  "field.knownPair": "What you know",
  "ohms.vr": "Voltage and resistance",
  "ohms.vi": "Voltage and current",
  "ohms.ir": "Current and resistance",
  "ohms.pv": "Power and voltage",
  "ohms.pi": "Power and current",
  "ohms.pr": "Power and resistance",
  "field.firstValue": "First value",
  "field.secondValue": "Second value",
  "result.voltage": "Voltage",
  "result.current": "Current",
  "result.resistance": "Resistance",
  "calc.ohms.note":
    "Ohm's law holds for ohmic components at a steady temperature. Semiconductors, lamps and motors are not ohmic, and their resistance changes as they heat up.",
  "calc.ohms.explain.1":
    "Ohm's law is V = I × R: voltage is current times resistance. Power adds one more relation, P = V × I, and every other formula you have seen is a rearrangement of those two.",
  "calc.ohms.explain.2":
    "That is why any two of the four quantities give you the other two. Knowing power and resistance, for instance, gives current as √(P/R), because P = I²R.",
  "calc.ohms.faq.1.q": "Why does my LED need a resistor?",
  "calc.ohms.faq.1.a":
    "An LED is not ohmic: past its forward voltage the current rises almost without limit, and it destroys itself. The series resistor is what sets the current, and Ohm's law sizes it.",
  "calc.ohms.faq.2.q": "Which is dangerous, voltage or current?",
  "calc.ohms.faq.2.a":
    "Current does the harm, but voltage is what drives it through your body's resistance. Neither figure is safe to reason about casually — treat mains wiring as work for a qualified electrician.",

  // ------------------------------------------------------------------ force
  "calc.force.title": "Force Calculator",
  "calc.force.desc": "Force from mass and acceleration, with the weight that mass has on Earth.",
  "field.mass": "Mass",
  "calc.force.massHint": "In kilograms.",
  "field.acceleration": "Acceleration",
  "calc.force.accelHint": "In m/s². Earth's gravity is 9.80665.",
  "result.force": "Force",
  "result.weightOnEarth": "Weight on Earth",
  "result.mass": "Mass",
  "result.kilogramForce": "Kilogram-force (kgf)",
  "calc.force.note":
    "Mass and weight are different quantities. Mass is how much matter there is and does not change; weight is the force gravity exerts on it, and would be about a sixth as much on the Moon.",
  "calc.force.explain.1":
    "Newton's second law: F = m × a. One newton is the force that accelerates one kilogram at one metre per second squared.",
  "calc.force.explain.2":
    "Weight is the special case where the acceleration is gravity, so an 80 kg person weighs about 785 N. Kilogram-force is that divided back by gravity, which is why equipment labelled in kgf reads the same as the mass.",
  "calc.force.faq.1.q": "Why is weight measured in newtons?",
  "calc.force.faq.1.a":
    "Because it is a force, and forces are measured in newtons. Bathroom scales report kilograms because that is what people want, but strictly they are measuring a force and dividing by gravity.",
  "calc.force.faq.2.q": "What acceleration should I enter?",
  "calc.force.faq.2.a":
    "Gravity, 9.80665 m/s², if you want weight. The actual acceleration if you want the force to produce it — a car reaching 100 km/h in 8 seconds accelerates at about 3.5 m/s².",

  // ----------------------------------------------------------------- torque
  "calc.torque.title": "Torque Calculator",
  "calc.torque.desc": "Turning force from a force applied at a distance, at any angle.",
  "field.appliedForce": "Applied force",
  "field.leverLength": "Lever length",
  "field.forceAngle": "Angle to the lever",
  "calc.torque.angleHint": "90° is a straight pull. Anything else wastes part of the force.",
  "result.torque": "Torque",
  "result.effectiveForce": "Effective force",
  "result.poundFeet": "Pound-feet (lb·ft)",
  "calc.torque.note":
    "Lever length is measured from the centre of rotation to where the force is applied, not the overall length of the spanner.",
  "calc.torque.explain.1":
    "Torque is force multiplied by the distance from the pivot: τ = F × r. Doubling the spanner length doubles the torque for the same pull, which is why a breaker bar works.",
  "calc.torque.explain.2":
    "Only the component at right angles to the lever turns anything, so the force is multiplied by sin of the angle. Pulling at 30° delivers half the torque of the same pull at 90°.",
  "calc.torque.faq.1.q": "Why does the angle matter so much?",
  "calc.torque.faq.1.a":
    "Because the component along the lever just pushes towards the pivot and does no turning at all. At 90° all of your effort turns the fastener; at 45° only about 71% of it does.",
  "calc.torque.faq.2.q": "How do N·m and lb·ft compare?",
  "calc.torque.faq.2.a":
    "One newton-metre is about 0.738 pound-feet, so a 100 N·m spec is roughly 74 lb·ft. Torque wrenches are sold calibrated in one or the other, and the conversion is shown above.",
});

writeFileSync(PATH, `${JSON.stringify(dict, null, 2)}\n`, "utf8");
console.log(`en.json now defines ${Object.keys(dict).length} keys.`);
