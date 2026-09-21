/** English copy for the Business, Everyday and Education calculator sets. */
import { readFileSync, writeFileSync } from "node:fs";

const PATH = "src/lib/i18n/dictionaries/en.json";
const dict = JSON.parse(readFileSync(PATH, "utf8"));

Object.assign(dict, {
  // ------------------------------------------------------------ shared fields
  "field.sellingPrice": "Selling price",
  "field.costPrice": "Cost price",
  "field.targetPercent": "Target percentage",
  "field.appliedAs": "Applied as",
  "option.asMarkup": "Markup on cost",
  "option.asMargin": "Margin on price",
  "result.sellingPrice": "Selling price",
  "result.costPrice": "Cost price",
  "result.grossProfit": "Gross profit",
  "result.profitMargin": "Profit margin",
  "result.markup": "Markup",

  // ------------------------------------------------------------ profit margin
  "calc.margin.title": "Profit Margin Calculator",
  "calc.margin.desc": "Margin, markup and gross profit from a cost and a selling price.",
  "calc.margin.lossNote":
    "The selling price is below cost, so this is a loss rather than a margin.",
  "calc.margin.explain.1":
    "Margin is profit as a share of the selling price: (price − cost) ÷ price. It answers \"of every pound that comes in, how much do I keep?\"",
  "calc.margin.explain.2":
    "Markup is the same profit measured against cost instead: (price − cost) ÷ cost. The two always differ, and margin is always the smaller number, because the price is always the larger denominator.",
  "calc.margin.faq.1.q": "Why is a 50% markup not a 50% margin?",
  "calc.margin.faq.1.a":
    "Because they divide by different things. Buy at 100 and add 50% markup and you sell at 150; the 50 profit is a third of 150, so the margin is 33.3%. Treating the two as the same is the classic pricing mistake.",
  "calc.margin.faq.2.q": "Is this gross or net margin?",
  "calc.margin.faq.2.a":
    "Gross. It counts only the direct cost of the thing you sold. Net margin subtracts overheads, wages, interest and tax as well, and is always lower.",

  // ------------------------------------------------------------------- markup
  "calc.markup.title": "Markup Calculator",
  "calc.markup.desc": "The price to charge to hit a target markup or margin on your cost.",
  "calc.markup.note":
    "Switching between markup and margin changes the price for the same percentage, which is exactly why the option is here rather than assumed.",
  "calc.markup.explain.1":
    "A markup is added to cost: cost × (1 + markup). A margin is taken out of price, so the price is cost ÷ (1 − margin). The second divides where the first multiplies, which is why they give different answers.",
  "calc.markup.explain.2":
    "Pick the basis your industry actually uses. Retail usually talks in margin, trade and wholesale usually in markup, and quoting one while thinking in the other quietly underprices the job.",
  "calc.markup.faq.1.q": "Which should I price on?",
  "calc.markup.faq.1.a":
    "Margin, if you are trying to hit a profitability target, because it maps directly to what stays in the business. Markup is easier to apply in your head at the counter.",
  "calc.markup.faq.2.q": "What markup gives a 50% margin?",
  "calc.markup.faq.2.a":
    "100%. To keep half the selling price you have to double the cost. As the target margin rises the markup rises much faster — a 75% margin needs a 300% markup.",

  // ---------------------------------------------------------------- break-even
  "calc.breakEven.title": "Break-Even Calculator",
  "calc.breakEven.desc":
    "How many units you must sell to cover your fixed costs, and the revenue that takes.",
  "field.fixedCosts": "Fixed costs",
  "field.pricePerUnit": "Price per unit",
  "field.variableCost": "Variable cost per unit",
  "result.breakEvenUnits": "Units to break even",
  "result.breakEvenRevenue": "Revenue at break-even",
  "result.contributionPerUnit": "Contribution per unit",
  "result.contributionMargin": "Contribution margin",
  "calc.breakEven.note":
    "Units are rounded up, because selling a fraction of one does not cover anything.",
  "calc.breakEven.neverNote":
    "Each unit costs at least as much to make as it sells for, so no volume breaks even — every extra sale widens the loss. Raise the price or cut the variable cost.",
  "calc.breakEven.explain.1":
    "Every unit sold contributes price minus variable cost towards the fixed costs. Break-even is simply fixed costs divided by that contribution.",
  "calc.breakEven.explain.2":
    "Contribution margin is that contribution as a share of the price. It is the more portable figure: it tells you what proportion of every sale is available to cover overheads, whatever the volume.",
  "calc.breakEven.faq.1.q": "What counts as a fixed cost?",
  "calc.breakEven.faq.1.a":
    "Anything you pay whether or not you sell anything — rent, salaries, insurance, software. Variable costs scale with volume: materials, packaging, payment fees, shipping.",
  "calc.breakEven.faq.2.q": "Why does a small price rise move break-even so much?",
  "calc.breakEven.faq.2.a":
    "Because the price change lands entirely on the contribution, which is the denominator. If contribution is 20% of the price, a 5% price rise raises contribution by a quarter and cuts the units needed by a fifth.",

  // ---------------------------------------------------------------------- ROI
  "calc.roi.title": "ROI Calculator",
  "calc.roi.desc": "Return on investment, in total and annualised.",
  "field.amountInvested": "Amount invested",
  "field.amountReturned": "Amount returned",
  "field.holdingPeriod": "Held for",
  "result.roi": "ROI",
  "result.netProfit": "Net profit",
  "result.annualisedReturn": "Annualised return",
  "result.amountInvested": "Amount invested",
  "calc.roi.note":
    "This ignores tax, fees and inflation, all of which reduce a real return.",
  "calc.roi.explain.1":
    "ROI is profit divided by what you put in: (returned − invested) ÷ invested. It is deliberately simple, which is both its appeal and its limitation.",
  "calc.roi.explain.2":
    "The limitation is that it says nothing about time. The annualised figure fixes that by compounding the return back over the holding period, so a 40% gain over three years is comparable with one over five.",
  "calc.roi.faq.1.q": "Why annualise?",
  "calc.roi.faq.1.a":
    "Because without it, longer investments always look better. A 40% total return is 11.9% a year over three years but only 7% over five — the same headline, a very different investment.",
  "calc.roi.faq.2.q": "Is ROI the same as profit?",
  "calc.roi.faq.2.a":
    "No. Profit is an amount, ROI is a rate. A £1,000 profit is excellent on £2,000 invested and poor on £200,000, which is the comparison ROI exists to make.",

  // --------------------------------------------------------------------- ROAS
  "calc.roas.title": "ROAS Calculator",
  "calc.roas.desc": "Return on ad spend, and the ROAS you actually need to break even.",
  "field.adSpend": "Ad spend",
  "field.revenueGenerated": "Revenue generated",
  "field.grossMarginPercent": "Gross margin",
  "calc.roas.marginHint": "Your margin on the products sold, before advertising.",
  "calc.roas.breakEvenHint": "Below this, the campaign loses money.",
  "result.roas": "ROAS",
  "result.profitAfterAds": "Profit after ad spend",
  "result.breakEvenRoas": "Break-even ROAS",
  "calc.roas.note":
    "A high ROAS on a thin margin can still lose money. The profit-after-ads row is the one that decides whether the campaign paid.",
  "calc.roas.explain.1":
    "ROAS is revenue divided by ad spend: spend 1,000 and make 4,000 and your ROAS is 4×. It measures the advertising, not the business.",
  "calc.roas.explain.2":
    "Break-even ROAS is 1 divided by your gross margin. On a 40% margin you need 2.5× just to stand still, because only 40p of each pound of revenue was ever available to pay for the advert.",
  "calc.roas.faq.1.q": "What is a good ROAS?",
  "calc.roas.faq.1.a":
    "Whatever clears your break-even ROAS with room to spare. There is no universal number: 2× is excellent on a software margin and ruinous on grocery margins.",
  "calc.roas.faq.2.q": "How is ROAS different from ROI?",
  "calc.roas.faq.2.a":
    "ROAS compares revenue to ad spend and ignores the cost of what you sold. ROI compares profit to total cost. ROAS is the campaign metric; ROI is the business one.",

  // -------------------------------------------------------------- growth rate
  "calc.growth.title": "Growth Rate Calculator",
  "calc.growth.desc": "Total growth, compound annual growth rate, and the change between two figures.",
  "field.startingValue": "Starting value",
  "field.endingValue": "Ending value",
  "field.periods": "Number of periods",
  "result.totalGrowth": "Total growth",
  "result.cagr": "CAGR",
  "result.absoluteChange": "Absolute change",
  "result.averagePerPeriod": "Simple average per period",
  "calc.growth.averageHint": "Shown for comparison; it overstates growth whenever the series compounds.",
  "calc.growth.note":
    "CAGR smooths the path completely. Two businesses with the same CAGR can have had very different years in between.",
  "calc.growth.explain.1":
    "Total growth is the change divided by where you started. CAGR is the steady rate that would have got you from the first figure to the last over the same number of periods.",
  "calc.growth.explain.2":
    "The simple average is shown because people reach for it, and it is almost always too high: dividing total growth by the number of periods ignores that each period compounds on the last.",
  "calc.growth.faq.1.q": "Why is CAGR lower than the simple average?",
  "calc.growth.faq.1.a":
    "Because growth compounds. Doubling over five years is 100% total, which averages to 20% a year — but 20% compounded for five years is nearly 149%. The true rate is 14.9%.",
  "calc.growth.faq.2.q": "Can I use this for anything other than money?",
  "calc.growth.faq.2.a":
    "Yes. Users, subscribers, page views, headcount — anything measured the same way at two points in time. The arithmetic does not care what the units are.",

  // ----------------------------------------------------------------- discount
  "calc.discount.title": "Discount Calculator",
  "calc.discount.desc": "The final price after a discount, and what you actually save.",
  "field.originalPrice": "Original price",
  "field.discountPercent": "Discount",
  "field.extraPercent": "Extra discount",
  "calc.discount.extraHint": "A second reduction applied to the already discounted price.",
  "result.finalPrice": "Final price",
  "result.youSave": "You save",
  "result.effectiveDiscount": "Effective discount",
  "result.originalPrice": "Original price",
  "calc.discount.stackNote":
    "Stacked discounts multiply rather than add: 20% off then a further 20% off is 36% off, not 40%.",
  "calc.discount.explain.1":
    "A discount is a percentage of the original price taken off it: final = price × (1 − discount).",
  "calc.discount.explain.2":
    "A second discount applies to what is left, not to the original, which is why two reductions never add up to their sum. The effective discount row shows what the two came to together.",
  "calc.discount.faq.1.q": "Is 50% off then 20% off the same as 70% off?",
  "calc.discount.faq.1.a":
    "No, it is 60% off. The 20% comes off the already halved price, so it removes 10% of the original rather than 20%.",
  "calc.discount.faq.2.q": "Does this include sales tax?",
  "calc.discount.faq.2.a":
    "No. Use the VAT or sales tax calculator for that. Whether tax applies before or after the discount depends on your country's rules.",

  // ---------------------------------------------------------------- fuel cost
  "calc.fuelCost.title": "Fuel Cost Calculator",
  "calc.fuelCost.desc": "What a journey costs in fuel, in whichever units your car reports.",
  "field.economyStyle": "Economy measured as",
  "option.litresPer100": "L/100 km",
  "option.kmPerLitre": "km per litre",
  "option.milesPerGallon": "Miles per gallon",
  "field.tripDistance": "Trip distance",
  "field.fuelEconomy": "Fuel economy",
  "field.fuelPrice": "Fuel price per unit",
  "result.tripCost": "Trip cost",
  "result.fuelUsed": "Fuel used",
  "result.costPerDistance": "Cost per unit of distance",
  "result.returnTrip": "Return trip",
  "calc.fuelCost.note":
    "Distance, economy and price must be in matching units — miles with gallons, kilometres with litres. Real consumption also varies with speed, load and traffic.",
  "calc.fuelCost.explain.1":
    "With economy quoted as distance per unit of fuel, the fuel used is distance ÷ economy. With consumption quoted per 100 km, it is distance × consumption ÷ 100 — the arithmetic reverses because the ratio is the other way up.",
  "calc.fuelCost.explain.2":
    "That reversal is also why the two cannot be compared directly: more km per litre is better, more litres per 100 km is worse.",
  "calc.fuelCost.faq.1.q": "Which economy figure should I use?",
  "calc.fuelCost.faq.1.a":
    "Whatever your car actually achieves, not the manufacturer's figure. Real-world consumption is usually 10–20% worse than the official test, and worse again on short urban trips.",
  "calc.fuelCost.faq.2.q": "Does a US gallon differ from a UK one?",
  "calc.fuelCost.faq.2.a":
    "Yes, substantially. A UK imperial gallon is about 4.546 litres against the US gallon's 3.785, so UK mpg figures look roughly 20% better for the same car. The fuel economy converter handles the conversion.",

  // ------------------------------------------------------------- electricity
  "calc.electricity.title": "Electricity Cost Calculator",
  "calc.electricity.desc": "What an appliance costs to run, per day, per month and per year.",
  "field.appliancePower": "Appliance power",
  "calc.electricity.wattsHint": "In watts — check the label or the manual.",
  "field.hoursPerDay": "Hours used per day",
  "field.pricePerKwh": "Price per kWh",
  "field.daysInPeriod": "Days in the period",
  "result.periodCost": "Cost for the period",
  "result.costPerDay": "Cost per day",
  "result.kwhPerDay": "kWh per day",
  "result.kwhTotal": "kWh in the period",
  "result.costPerYear": "Cost per year",
  "calc.electricity.note":
    "This assumes the appliance draws its rated power the whole time it is on. Anything thermostatic — a fridge, a heater, a kettle — cycles, so real consumption is lower.",
  "calc.electricity.explain.1":
    "A kilowatt-hour is a thousand watts drawn for one hour. So daily energy is watts × hours ÷ 1,000, and the cost is that multiplied by your tariff.",
  "calc.electricity.explain.2":
    "The annual figure is the one worth looking at. A 5 W device left on permanently costs little per day and rather more over a year, and a 2 kW heater is the reverse of that arithmetic.",
  "calc.electricity.faq.1.q": "Where do I find the price per kWh?",
  "calc.electricity.faq.1.a":
    "On your electricity bill, usually as a unit rate. Remember there is normally a standing charge as well, which you pay regardless of use and which this does not include.",
  "calc.electricity.faq.2.q": "Why is my bill higher than this suggests?",
  "calc.electricity.faq.2.a":
    "Because this costs one appliance. Standing charges, tax and everything else plugged in are all on the same bill. Use it to compare appliances rather than to predict the total.",

  // ----------------------------------------------------------------- recipe
  "calc.recipe.title": "Recipe Scaler",
  "calc.recipe.desc": "Scale every ingredient in a recipe to the number of servings you need.",
  "field.recipeServes": "Recipe serves",
  "field.youNeed": "You need servings for",
  "field.ingredientAmount": "An ingredient amount",
  "calc.recipe.amountHint": "Any quantity from the recipe — grams, millilitres, whatever it uses.",
  "result.scaleFactor": "Scale factor",
  "result.scaledAmount": "Scaled amount",
  "result.originalAmount": "Original amount",
  "column.original": "Original",
  "column.scaled": "Scaled",
  "calc.recipe.note":
    "Ingredients scale; cooking times do not. A double batch in the same tin is deeper and takes longer, and seasoning is usually better scaled by taste than by arithmetic.",
  "calc.recipe.explain.1":
    "Every quantity is multiplied by the same factor: desired servings ÷ original servings. The table converts the common amounts at that factor so you can read them off.",
  "calc.recipe.explain.2":
    "Raising agents, salt and strong spices are the exceptions worth watching. They often scale slightly less than linearly, especially when more than doubling a recipe.",
  "calc.recipe.faq.1.q": "Can I scale a baking recipe?",
  "calc.recipe.faq.1.a":
    "The ingredients, yes — baking is a ratio, and keeping the ratio keeps the result. Tin size and baking time are the hard part: a deeper mixture needs a lower temperature for longer.",
  "calc.recipe.faq.2.q": "How do I scale an egg?",
  "calc.recipe.faq.2.a":
    "By weight. A medium egg is roughly 50 g out of the shell, so beat one and measure out the fraction you need rather than rounding to a whole egg.",

  // -------------------------------------------------------------------- GPA
  "calc.gpa.title": "GPA Calculator",
  "calc.gpa.desc": "Grade point average on the 4.0 scale, weighted by course credits.",
  "grade.aPlus": "A+",
  "grade.a": "A",
  "grade.aMinus": "A−",
  "grade.bPlus": "B+",
  "grade.b": "B",
  "grade.bMinus": "B−",
  "grade.cPlus": "C+",
  "grade.c": "C",
  "grade.cMinus": "C−",
  "grade.d": "D",
  "grade.f": "F",
  "field.courseGrade1": "Course 1 grade",
  "field.courseCredits1": "Course 1 credits",
  "field.courseGrade2": "Course 2 grade",
  "field.courseCredits2": "Course 2 credits",
  "field.courseGrade3": "Course 3 grade",
  "field.courseCredits3": "Course 3 credits",
  "field.courseGrade4": "Course 4 grade",
  "field.courseCredits4": "Course 4 credits",
  "field.courseGrade5": "Course 5 grade",
  "field.courseCredits5": "Course 5 credits",
  "field.courseGrade6": "Course 6 grade",
  "field.courseCredits6": "Course 6 credits",
  "result.gpa": "GPA",
  "result.totalCredits": "Total credits",
  "result.coursesCounted": "Courses counted",
  "result.qualityPoints": "Quality points",
  "calc.gpa.note":
    "Courses with zero credits are ignored, so you can leave the slots you do not need. This uses the common US 4.0 scale; your institution's own scale may differ, and many weight honours or advanced courses higher.",
  "calc.gpa.explain.1":
    "Each grade is worth a number of points. Multiply by the course's credits, add those up, and divide by the total credits. Credits are weights, so a four-credit course moves your average twice as far as a two-credit one.",
  "calc.gpa.explain.2":
    "The sum before dividing is the quality points, which is the figure a transcript usually shows. Seeing it makes clear why dropping one credit-heavy course changes the average so much.",
  "calc.gpa.faq.1.q": "Is an A+ worth more than an A?",
  "calc.gpa.faq.1.a":
    "Not on the standard 4.0 scale, where both are 4.0 and 4.0 is the ceiling. Some institutions use 4.3 for an A+, which is one reason GPAs are not perfectly comparable between schools.",
  "calc.gpa.faq.2.q": "How do I convert this to a percentage?",
  "calc.gpa.faq.2.a":
    "There is no reliable universal conversion, and any table claiming one is an approximation. Institutions map grades to percentages differently, so use the one your own institution publishes.",

  // --------------------------------------------------------- weighted grade
  "calc.weightedGrade.title": "Weighted Grade Calculator",
  "calc.weightedGrade.desc": "Your overall grade when assessments count for different amounts.",
  "field.assessmentScore1": "Assessment 1 score",
  "field.assessmentWeight1": "Assessment 1 weight",
  "field.assessmentScore2": "Assessment 2 score",
  "field.assessmentWeight2": "Assessment 2 weight",
  "field.assessmentScore3": "Assessment 3 score",
  "field.assessmentWeight3": "Assessment 3 weight",
  "field.assessmentScore4": "Assessment 4 score",
  "field.assessmentWeight4": "Assessment 4 weight",
  "field.assessmentScore5": "Assessment 5 score",
  "field.assessmentWeight5": "Assessment 5 weight",
  "result.weightedScore": "Weighted grade",
  "result.weightUsed": "Weight accounted for",
  "result.assessmentsCounted": "Assessments counted",
  "calc.weightedGrade.note":
    "Assessments with zero weight are ignored, so unused slots can be left alone.",
  "calc.weightedGrade.partialNote":
    "Your weights add to {weight}%, not 100%. The grade shown is your average across only that part of the course — useful mid-term, but not your final standing.",
  "calc.weightedGrade.explain.1":
    "Each score is multiplied by its weight, those are added up, and the total is divided by the total weight. An exam worth 50% moves your grade five times as much as a quiz worth 10%.",
  "calc.weightedGrade.explain.2":
    "Dividing by the weight actually used, rather than by 100, is what lets this work part-way through a course: it gives your average so far rather than assuming the remaining assessments scored zero.",
  "calc.weightedGrade.faq.1.q": "My weights do not add to 100. Is that a problem?",
  "calc.weightedGrade.faq.1.a":
    "Not for the arithmetic — the result is your average over the assessments entered. It matters for interpretation: that figure is your standing so far, not your final grade.",
  "calc.weightedGrade.faq.2.q": "How is this different from a plain average?",
  "calc.weightedGrade.faq.2.a":
    "A plain average treats every assessment as equally important. If your final exam is worth half the course and a quiz is worth a twentieth, a plain average is badly misleading.",

  // ------------------------------------------------------------ final grade
  "calc.finalGrade.title": "Final Grade Calculator",
  "calc.finalGrade.desc": "The mark you need on what is left to reach the grade you want.",
  "field.currentGrade": "Current grade",
  "field.completedWeight": "Course completed",
  "calc.finalGrade.completedHint": "The share of the total grade already assessed.",
  "field.targetGrade": "Target grade",
  "result.scoreNeeded": "You need",
  "result.remainingWeight": "Weight remaining",
  "result.alreadyEarned": "Points already earned",
  "calc.finalGrade.note":
    "This assumes the rest of the course is graded on the same percentage scale as what you have done so far.",
  "calc.finalGrade.impossibleNote":
    "That target needs more than 100% on what is left, so it is out of reach — the figure is shown as it is rather than capped, because a capped 100% would wrongly suggest it is still possible.",
  "calc.finalGrade.explain.1":
    "The points you have already banked are your current grade multiplied by the share of the course completed. Subtract that from the target and spread what is missing across the weight that remains.",
  "calc.finalGrade.explain.2":
    "The less of the course that is left, the more extreme the answer becomes. With 10% remaining, moving your overall grade by a single point needs ten points on the final assessment.",
  "calc.finalGrade.faq.1.q": "It says I need more than 100%. What now?",
  "calc.finalGrade.faq.1.a":
    "The target is not reachable through the remaining assessments alone. Work out the best grade still available by setting the target down until the requirement drops to 100, and ask about resits or extra credit if they exist.",
  "calc.finalGrade.faq.2.q": "What if my final exam is worth a different amount?",
  "calc.finalGrade.faq.2.a":
    "Enter the share of the whole course you have completed, and the remaining weight follows automatically. If 70% is done, the rest is worth 30% however many assessments make it up.",
});

writeFileSync(PATH, `${JSON.stringify(dict, null, 2)}\n`, "utf8");
console.log(`en.json now defines ${Object.keys(dict).length} keys.`);
