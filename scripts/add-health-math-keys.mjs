/** English copy for the Health and Maths calculator sets. */
import { readFileSync, writeFileSync } from "node:fs";

const PATH = "src/lib/i18n/dictionaries/en.json";
const dict = JSON.parse(readFileSync(PATH, "utf8"));

Object.assign(dict, {
  // ------------------------------------------------------------ shared units
  "units.kilograms": "kg",
  "units.pounds": "lb",
  "units.grams": "g",
  "units.litres": "litres",
  "units.kcalPerDay": "kcal per day",
  "units.kmh": "km/h",
  "units.mph": "mph",
  "units.degrees": "degrees",
  "units.squared": "square units",
  "units.cubed": "cubic units",

  "field.units": "Units",
  "option.metric": "Metric",
  "option.imperial": "Imperial",
  "option.male": "Male",
  "option.female": "Female",

  "field.weightKg": "Weight (kg)",
  "field.weightLb": "Weight (lb)",
  "field.heightCm": "Height (cm)",
  "field.heightFt": "Height (ft)",
  "field.heightIn": "Height (in)",
  "field.age": "Age",
  "field.sex": "Sex",

  // -------------------------------------------------------------------- BMI
  "calc.bmi.title": "BMI Calculator",
  "calc.bmi.desc":
    "Body mass index from your height and weight, with the healthy weight range for your height.",
  "result.bmi": "BMI",
  "result.bmiBand": "Category",
  "result.healthyRangeLow": "Healthy range from",
  "result.healthyRangeHigh": "Healthy range to",
  "bmi.band.underweight": "Underweight",
  "bmi.band.healthy": "Healthy weight",
  "bmi.band.overweight": "Overweight",
  "bmi.band.obese": "Obese",
  "calc.bmi.note":
    "BMI is a screening measure for populations, not a diagnosis for an individual. It cannot tell muscle from fat, so a very muscular person can read as overweight while being nothing of the kind.",
  "calc.bmi.explain.1":
    "BMI divides your weight in kilograms by the square of your height in metres. The same number is used worldwide, which is why it is a useful common reference even though it is a blunt one.",
  "calc.bmi.explain.2":
    "The bands come from the World Health Organization: under 18.5 underweight, 18.5 to 24.9 healthy, 25 to 29.9 overweight, 30 and above obese. They describe risk across a population, not what is right for you.",
  "calc.bmi.faq.1.q": "Is BMI accurate for athletes?",
  "calc.bmi.faq.1.a":
    "Often not. Muscle is denser than fat, so a trained athlete can have a BMI in the overweight band with very little body fat. A body fat estimate is more informative in that case.",
  "calc.bmi.faq.2.q": "Does BMI work the same for everyone?",
  "calc.bmi.faq.2.a":
    "No. The standard bands were derived largely from European populations, and some health bodies use lower thresholds for people of South Asian descent. BMI is also not designed for children, pregnant people or the very elderly.",

  // -------------------------------------------------------------------- BMR
  "calc.bmr.title": "BMR Calculator",
  "calc.bmr.desc":
    "The energy your body uses at complete rest, and what that becomes at each activity level.",
  "result.bmr": "BMR",
  "activity.sedentary": "Sedentary (little exercise)",
  "activity.light": "Lightly active (1–3 days a week)",
  "activity.moderate": "Moderately active (3–5 days)",
  "activity.active": "Very active (6–7 days)",
  "activity.athlete": "Athlete (twice daily)",
  "calc.bmr.note":
    "These are estimates from a population equation. Individual metabolic rate varies by several hundred calories a day for reasons the formula cannot see.",
  "calc.bmr.explain.1":
    "Basal metabolic rate is what you would burn lying still all day: keeping your heart beating, your temperature steady and your cells running. It is the floor, not a target.",
  "calc.bmr.explain.2":
    "This uses the Mifflin-St Jeor equation, which is the more accurate of the two common formulas against measured data. The rows beneath show BMR multiplied by the standard activity factors.",
  "calc.bmr.faq.1.q": "Should I eat my BMR?",
  "calc.bmr.faq.1.a":
    "No. BMR excludes everything you do while awake. Eating at BMR for long is a substantial deficit for most people. The activity-adjusted figures are the more useful starting point.",
  "calc.bmr.faq.2.q": "Why does BMR fall as I lose weight?",
  "calc.bmr.faq.2.a":
    "A smaller body costs less to run. Weight appears in the equation directly, so the same person at a lower weight has a lower BMR — which is why a deficit that worked at the start stops working later.",

  // ------------------------------------------------------------------- TDEE
  "calc.tdee.title": "TDEE & Calorie Calculator",
  "calc.tdee.desc":
    "Daily calories to maintain, lose or gain weight, with a macronutrient split.",
  "field.activityLevel": "Activity level",
  "field.goal": "Goal",
  "option.goalLose": "Lose weight",
  "option.goalMaintain": "Maintain",
  "option.goalGain": "Gain weight",
  "result.dailyCalories": "Daily calories",
  "result.maintenance": "Maintenance calories",
  "result.protein": "Protein",
  "result.carbs": "Carbohydrate",
  "result.fat": "Fat",
  "calc.tdee.note":
    "The macro split shown is a common 30/40/30 starting point, not a prescription. Anyone with a medical condition, or who is pregnant, should take dietary targets from a professional rather than a calculator.",
  "calc.tdee.explain.1":
    "Total daily energy expenditure is your BMR multiplied by an activity factor. It is the number of calories that would keep your weight steady.",
  "calc.tdee.explain.2":
    "The lose and gain options shift that by 500 calories a day, which is the usual starting point for roughly half a kilogram a week. Track what actually happens for a fortnight and adjust — the equation is an estimate, your bathroom scale is data.",
  "calc.tdee.faq.1.q": "Why 500 calories?",
  "calc.tdee.faq.1.a":
    "Roughly 7,700 calories is commonly used as the energy in a kilogram of body fat, so 500 a day is about half a kilogram a week. It is a rule of thumb, and real rates vary.",
  "calc.tdee.faq.2.q": "Which activity level should I pick?",
  "calc.tdee.faq.2.a":
    "Most people overestimate. If you have a desk job and train three times a week, that is light to moderate, not very active. Picking one level lower and adjusting upwards usually lands closer.",

  // --------------------------------------------------------------- body fat
  "calc.bodyFat.title": "Body Fat Calculator",
  "calc.bodyFat.desc":
    "Estimate body fat percentage from tape measurements using the US Navy method.",
  "field.neck": "Neck circumference",
  "field.waist": "Waist circumference",
  "field.hip": "Hip circumference",
  "calc.bodyFat.measureHint": "In centimetres, or inches multiplied by 2.54.",
  "result.bodyFat": "Body fat",
  "result.fatMass": "Fat mass",
  "result.leanMass": "Lean mass",
  "calc.bodyFat.note":
    "The circumference method has a stated error of roughly three to four percentage points, and depends heavily on measuring in the same place each time. Treat the trend as meaningful and any single reading as approximate.",
  "calc.bodyFat.explain.1":
    "The US Navy method estimates body fat from the difference between your waist and neck measurements, scaled by height. Women's estimate adds the hip measurement, because fat distribution differs.",
  "calc.bodyFat.explain.2":
    "It works because fat is not distributed evenly: a larger waist relative to neck and height reliably indicates a higher fat percentage across a population, without needing any equipment beyond a tape measure.",
  "calc.bodyFat.faq.1.q": "Where exactly do I measure?",
  "calc.bodyFat.faq.1.a":
    "Neck just below the larynx, sloping slightly downward at the front. Waist at the navel for men, at the narrowest point for women. Hips at the widest point. Keep the tape level and snug without compressing.",
  "calc.bodyFat.faq.2.q": "How does this compare to a body fat scale?",
  "calc.bodyFat.faq.2.a":
    "Differently, and both are estimates. Bioelectrical scales are sensitive to hydration and can swing several points day to day. Neither replaces a DEXA scan, but both are useful for tracking direction.",

  // ------------------------------------------------------------------ water
  "calc.water.title": "Water Intake Calculator",
  "calc.water.desc":
    "A daily water target from your body weight and how much you exercise.",
  "field.exerciseMinutes": "Exercise (minutes per day)",
  "result.dailyWater": "Daily water",
  "result.glasses": "Glasses (250 ml)",
  "result.millilitres": "Millilitres",
  "calc.water.note":
    "Roughly a fifth of most people's fluid comes from food, and needs rise in heat, at altitude and during illness. Thirst is a reasonable guide for healthy adults; this is a starting point, not a quota.",
  "calc.water.explain.1":
    "The baseline is about 35 ml of water per kilogram of body weight, which is a widely used general guideline for healthy adults.",
  "calc.water.explain.2":
    "Exercise adds roughly 350 ml per half hour to replace what is lost through sweat and breathing. Hot weather or hard training push that higher.",
  "calc.water.faq.1.q": "Does tea or coffee count?",
  "calc.water.faq.1.a":
    "Yes. The mild diuretic effect of caffeine at normal intakes does not outweigh the fluid in the drink itself. Food contributes too — fruit and vegetables especially.",
  "calc.water.faq.2.q": "Can I drink too much water?",
  "calc.water.faq.2.a":
    "Rarely, but yes. Drinking far more than you lose can dilute blood sodium, which is dangerous. This mainly affects endurance athletes. If a target here feels like a lot to force down, it probably is.",

  // ------------------------------------------------------------------- pace
  "calc.pace.title": "Running Pace Calculator",
  "calc.pace.desc":
    "Pace, speed and predicted finishing times from a distance and a time.",
  "field.useMiles": "Use miles",
  "field.distance": "Distance",
  "field.hours": "Hours",
  "field.minutes": "Minutes",
  "field.seconds": "Seconds",
  "result.pacePerKm": "Pace per km",
  "result.pacePerMile": "Pace per mile",
  "result.speed": "Average speed",
  "result.totalTime": "Total time",
  "column.race": "Distance",
  "column.finishTime": "Finish time",
  "race.5k": "5K",
  "race.10k": "10K",
  "race.halfMarathon": "Half marathon",
  "race.marathon": "Marathon",
  "calc.pace.note":
    "The race times assume you hold this exact pace throughout. In practice pace drifts over longer distances, so treat the marathon figure in particular as optimistic.",
  "calc.pace.explain.1":
    "Pace is time divided by distance — how long each kilometre or mile takes. Speed is the same information the other way round, as distance per hour.",
  "calc.pace.explain.2":
    "The table applies your pace to the standard race distances. A half marathon is 21.0975 km and a marathon 42.195 km; the odd figures are the official distances, not rounding.",
  "calc.pace.faq.1.q": "Why is my marathon prediction too fast?",
  "calc.pace.faq.1.a":
    "Because it assumes constant pace. Most runners slow over a marathon, and predictors built from race data apply a fatigue factor. Use this to compare efforts, not to set a race-day target.",
  "calc.pace.faq.2.q": "What is a good pace?",
  "calc.pace.faq.2.a":
    "Whatever lets you finish the session you meant to do. Easy runs should feel conversational — most recreational runners run their easy days too hard and their hard days too easy.",

  // ------------------------------------------------------------- statistics
  "calc.statistics.title": "Statistics Calculator",
  "calc.statistics.desc":
    "Mean, median, mode, range and standard deviation for a set of numbers.",
  "field.numberList": "Your numbers",
  "calc.statistics.listHint":
    "Separate values with commas or spaces, e.g. 12, 15, 15, 18.",
  "calc.statistics.sampleHint": "Use this one when your numbers are a sample of a larger group.",
  "calc.statistics.empty": "Enter some numbers, separated by commas or spaces.",
  "result.mean": "Mean",
  "result.median": "Median",
  "result.mode": "Mode",
  "result.count": "Count",
  "result.sum": "Sum",
  "result.min": "Minimum",
  "result.max": "Maximum",
  "result.range": "Range",
  "result.sampleStdDev": "Standard deviation (sample)",
  "result.populationStdDev": "Standard deviation (population)",
  "result.variance": "Variance",
  "calc.statistics.explain.1":
    "The mean is the total divided by how many values there are. The median is the middle value once they are sorted, which is why it is the more honest summary when a few extreme values would drag the mean around.",
  "calc.statistics.explain.2":
    "Standard deviation measures how spread out the values are. The sample version divides by one less than the count — Bessel's correction — because a sample underestimates the spread of the population it came from.",
  "calc.statistics.faq.1.q": "Which standard deviation do I want?",
  "calc.statistics.faq.1.a":
    "Sample, almost always. Use the population version only when your numbers are the entire group you care about, such as the marks of every student in one class rather than a sample of them.",
  "calc.statistics.faq.2.q": "Why is the mode sometimes empty?",
  "calc.statistics.faq.2.a":
    "Because nothing repeated. A set where every value appears once has no mode; calling every value a mode would be technically arguable and useless.",

  // ------------------------------------------------------------------ ratio
  "calc.ratio.title": "Ratio Calculator",
  "calc.ratio.desc": "Simplify a ratio, convert it to a decimal or a percentage, and scale it up.",
  "field.ratioA": "First term",
  "field.ratioB": "Second term",
  "field.scaleTo": "Scale first term to",
  "calc.ratio.scaleHint": "Solves A : B = this : ? — useful for scaling a recipe or a mix.",
  "calc.ratio.scaledHint": "The second term at that scale.",
  "result.simplifiedRatio": "Simplified ratio",
  "result.decimalRatio": "As a decimal",
  "result.percentOfTotal": "First term's share",
  "result.scaledPartner": "Scaled second term",
  "result.ratioA": "First term",
  "result.ratioB": "Second term",
  "calc.ratio.explain.1":
    "A ratio is simplified by dividing both terms by their greatest common divisor, exactly as a fraction is. Decimal terms are scaled to whole numbers first, so 2.5 : 5 reduces properly to 1 : 2.",
  "calc.ratio.explain.2":
    "Scaling uses the cross-multiplication rule: if A : B and you want the first term to become C, the second becomes B × C ÷ A. That is the arithmetic behind doubling a recipe or mixing fuel.",
  "calc.ratio.faq.1.q": "What is the difference between a ratio and a fraction?",
  "calc.ratio.faq.1.a":
    "A ratio compares two parts to each other; a fraction compares one part to the whole. In a 1 : 3 mix there are four parts in total, so the first ingredient is a quarter, not a third.",
  "calc.ratio.faq.2.q": "Can a ratio have decimals?",
  "calc.ratio.faq.2.a":
    "You can enter them, and this simplifies them to whole numbers. Ratios are usually written in whole numbers precisely because that is easier to measure out.",

  // --------------------------------------------------------------- exponent
  "calc.exponent.title": "Exponent Calculator",
  "calc.exponent.desc": "Powers, roots and logarithms, with the inverse of each.",
  "field.base": "Base",
  "field.exponent": "Exponent",
  "field.rootDegree": "Root degree",
  "calc.exponent.rootHint": "The nth root of the base.",
  "calc.exponent.negativeNote":
    "A negative base has a real root only for an odd degree; even roots of a negative number are not real, and are shown as a dash.",
  "result.power": "Result",
  "result.nthRoot": "nth root",
  "result.squareRoot": "Square root",
  "result.logarithm": "Logarithm of the result",
  "calc.exponent.explain.1":
    "An exponent is repeated multiplication: 2⁵ is 2 multiplied by itself five times. A fractional exponent is a root, and a negative exponent is a reciprocal — 2⁻¹ is one half.",
  "calc.exponent.explain.2":
    "The logarithm is the inverse question: to what power must the base be raised to reach this number? That is why the logarithm shown returns the exponent you entered.",
  "calc.exponent.faq.1.q": "What is anything to the power of zero?",
  "calc.exponent.faq.1.a":
    "One, for every base except zero itself. It follows from the rule that dividing powers subtracts exponents: any number divided by itself is one, and its exponent is zero.",
  "calc.exponent.faq.2.q": "Why is the square root of a negative number not shown?",
  "calc.exponent.faq.2.a":
    "Because there is no real number that squares to a negative. Such roots exist as imaginary numbers; the quadratic calculator shows them where they arise.",

  // -------------------------------------------------------------- quadratic
  "calc.quadratic.title": "Quadratic Equation Calculator",
  "calc.quadratic.desc":
    "Solve ax² + bx + c = 0, with the discriminant and the turning point.",
  "field.coefficientA": "a",
  "field.coefficientB": "b",
  "field.coefficientC": "c",
  "result.roots": "Roots",
  "result.discriminant": "Discriminant",
  "result.rootType": "Roots are",
  "result.vertexX": "Vertex x",
  "result.vertexY": "Vertex y",
  "quadratic.two": "Two distinct real roots",
  "quadratic.one": "One repeated real root",
  "quadratic.complex": "A complex conjugate pair",
  "calc.quadratic.notQuadratic":
    "With a = 0 this is not a quadratic but a straight line, which has at most one root.",
  "calc.quadratic.explain.1":
    "The quadratic formula gives the roots as (−b ± √(b² − 4ac)) ÷ 2a. The part under the square root is the discriminant, and its sign decides what kind of roots you get.",
  "calc.quadratic.explain.2":
    "A positive discriminant means the parabola crosses the x-axis twice, zero means it just touches, and a negative one means it never does — the roots are then a complex pair, shown here rather than dismissed as no solution.",
  "calc.quadratic.faq.1.q": "What does the vertex tell me?",
  "calc.quadratic.faq.1.a":
    "It is the turning point: the minimum when a is positive, the maximum when a is negative. It sits exactly halfway between the two roots when they are real.",
  "calc.quadratic.faq.2.q": "What does the i mean in the answer?",
  "calc.quadratic.faq.2.a":
    "It is the imaginary unit, the square root of −1. Complex roots always come in pairs that differ only in the sign of the imaginary part, which is what the ± shows.",

  // --------------------------------------------------------------- triangle
  "calc.triangle.title": "Right Triangle Calculator",
  "calc.triangle.desc":
    "Hypotenuse, area, perimeter and angles from the two shorter sides.",
  "field.sideA": "Side a",
  "field.sideB": "Side b",
  "result.hypotenuse": "Hypotenuse",
  "result.area": "Area",
  "result.perimeter": "Perimeter",
  "result.angleA": "Angle opposite a",
  "result.angleB": "Angle opposite b",
  "calc.triangle.explain.1":
    "Pythagoras' theorem: in a right triangle the square of the hypotenuse equals the sum of the squares of the other two sides, so c = √(a² + b²).",
  "calc.triangle.explain.2":
    "The angles come from the arctangent of the two sides. They always add to 90 degrees, because the third angle of a right triangle has already used the other 90.",
  "calc.triangle.faq.1.q": "Does this work for any triangle?",
  "calc.triangle.faq.1.a":
    "No — Pythagoras' theorem applies only to right triangles. For others you need the law of cosines, which reduces to Pythagoras when the angle is exactly 90 degrees.",
  "calc.triangle.faq.2.q": "What is a Pythagorean triple?",
  "calc.triangle.faq.2.a":
    "Three whole numbers that satisfy the theorem, such as 3-4-5 or 5-12-13. They are useful on site because a 3-4-5 measurement squares a corner with nothing but a tape measure.",

  // ------------------------------------------------------------ area/volume
  "calc.area.title": "Area Calculator",
  "calc.area.desc": "Area and perimeter for rectangles, triangles, circles and more.",
  "calc.volume.title": "Volume Calculator",
  "calc.volume.desc": "Volume and surface area for boxes, cylinders, spheres and cones.",
  "field.shape": "Shape",
  "field.dimensionA": "Dimension A",
  "field.dimensionB": "Dimension B",
  "field.dimensionC": "Dimension C",
  "result.shape": "Shape",
  "result.volume": "Volume",
  "result.surfaceArea": "Surface area",
  "result.litresIfMetres": "Litres, if measured in metres",
  "shape.rectangle": "Rectangle",
  "shape.triangle": "Triangle",
  "shape.circle": "Circle",
  "shape.trapezoid": "Trapezoid",
  "shape.parallelogram": "Parallelogram",
  "shape.box": "Box",
  "shape.cylinder": "Cylinder",
  "shape.sphere": "Sphere",
  "shape.cone": "Cone",
  "calc.area.note":
    "Units are whatever you put in. Enter metres and the area is square metres; enter feet and it is square feet.",
  "calc.volume.note":
    "Units follow your input. A cubic metre is exactly 1,000 litres, which is what the last row converts.",
  "calc.area.explain.1":
    "For a rectangle, area is the two sides multiplied. For a triangle it is base times height halved. For a circle it is πr², and for a trapezoid the average of the parallel sides times the height.",
  "calc.area.explain.2":
    "Dimension A is the first side, or the radius for a circle. For a triangle A and B are base and height; for a trapezoid A and B are the parallel sides and C is the height.",
  "calc.area.faq.1.q": "What is the difference between area and perimeter?",
  "calc.area.faq.1.a":
    "Area is the surface inside the shape — how much paint or turf it takes. Perimeter is the distance around the edge — how much fencing or trim.",
  "calc.area.faq.2.q": "Why does the triangle ask for three dimensions?",
  "calc.area.faq.2.a":
    "Area needs only the base and height. The third side is used for the perimeter; leave it and a right triangle is assumed, so the third side is computed from the other two.",
  "calc.volume.explain.1":
    "Volume is area carried through a third dimension: a box is length × width × height, a cylinder is its circular area πr² times its height, and a cone is a third of the cylinder that would contain it.",
  "calc.volume.explain.2":
    "Dimension A is the first edge, or the radius for round shapes. B is the height for a cylinder or cone. A sphere needs only its radius.",
  "calc.volume.faq.1.q": "Why is a cone a third of a cylinder?",
  "calc.volume.faq.1.a":
    "Because three cones of the same radius and height fill exactly one cylinder. It is a classical result, provable by integration and demonstrable with water and two containers.",
  "calc.volume.faq.2.q": "How do I get litres or gallons from this?",
  "calc.volume.faq.2.a":
    "Measure in metres and multiply cubic metres by 1,000 for litres, which the last row does. For gallons, take those litres to the volume converter.",
});

writeFileSync(PATH, `${JSON.stringify(dict, null, 2)}\n`, "utf8");
console.log(`en.json now defines ${Object.keys(dict).length} keys.`);
