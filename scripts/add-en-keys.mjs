/**
 * Adds the English copy introduced by the House of Calculators architecture.
 * Idempotent: run it again after adding keys and it just rewrites the file.
 */
import { readFileSync, writeFileSync } from "node:fs";

const PATH = "src/lib/i18n/dictionaries/en.json";
const dict = JSON.parse(readFileSync(PATH, "utf8"));

Object.assign(dict, {
  /* Brand */
  "app.name": "House of Calculators",
  "app.positioning": "Every Calculation. One Global Home.",
  "app.tagline": "Calculate, convert, compare and understand - fast.",

  /* Navigation and shell */
  "nav.home": "Home",
  "header.primary": "Main navigation",
  "header.moreLanguages": "More languages",
  "a11y.skipToContent": "Skip to content",
  "a11y.breadcrumb": "Breadcrumb",
  "ads.label": "Advertisement",

  "common.viewAll": "View all",
  "common.next": "Next",
  "common.previous": "Previous",
  "common.pageOf": "Page {current} of {total}",

  /* Sections */
  "section.calculators": "Calculators",
  "section.converters": "Converters",
  "section.tools": "Tools",
  "section.charts": "Charts & Tables",
  "section.guides": "Guides",
  "section.countries": "Country Tools",

  "section.calculators.desc": "Work out payments, tax, returns and more.",
  "section.converters.desc": "Convert between units with reference tables.",
  "section.tools.desc": "Date, number and planning utilities.",
  "section.charts.desc": "Reference tables you can scan at a glance.",
  "section.guides.desc": "How the numbers are worked out, explained.",
  "section.countries.desc": "Tools built around one country's rules.",

  "section.calculators.intro":
    "Every calculator runs in your browser, uses your country's currency and formatting, and shows how the answer was reached rather than just the number.",
  "section.converters.intro":
    "Convert between units, see the conversion factor, and scan a reference table for the values you need most often.",
  "section.countries.intro":
    "Some calculations depend on where you are: tax bands, social contributions, property duties and payroll rules all differ. These tools follow one country's rules.",

  /* Categories */
  "category.calculators.finance": "Finance",
  "category.calculators.math": "Math",
  "category.calculators.health": "Health & Fitness",
  "category.calculators.business": "Business",
  "category.calculators.education": "Education",
  "category.calculators.engineering": "Engineering",
  "category.calculators.construction": "Construction",
  "category.calculators.everyday": "Everyday",

  "category.calculators.finance.intro":
    "Loans, tax, savings and retirement - the calculations that decide what a decision actually costs.",
  "category.calculators.math.intro":
    "Percentages, fractions, averages and the everyday arithmetic worth double-checking.",
  "category.calculators.health.intro":
    "Body measurements and energy estimates, for general information rather than medical advice.",
  "category.calculators.business.intro":
    "Margin, growth, payroll cost and the numbers behind running something.",
  "category.calculators.education.intro":
    "Grades, averages and scores, worked out the way they are actually marked.",
  "category.calculators.engineering.intro":
    "Units, forces and electrical calculations with the formulas shown.",
  "category.calculators.construction.intro":
    "Material quantities and areas, so an estimate starts from arithmetic rather than a guess.",
  "category.calculators.everyday.intro":
    "The small calculations that come up away from a desk.",

  "category.converters.currency": "Currency",
  "category.converters.length": "Length",
  "category.converters.weight": "Weight",
  "category.converters.temperature": "Temperature",
  "category.converters.area": "Area",
  "category.converters.volume": "Volume",
  "category.converters.speed": "Speed",
  "category.converters.data": "Data",
  "category.converters.energy": "Energy",
  "category.converters.pressure": "Pressure",
  "category.converters.power": "Power",
  "category.converters.time": "Time",
  "category.converters.angle": "Angle",
  "category.converters.fuel-economy": "Fuel Economy",

  "category.page.title": "{category} Calculators",
  "category.page.desc":
    "Free {category} calculators with the formula, a worked breakdown and your own currency.",
  "category.empty": "Nothing here yet.",

  /* Home */
  "home.hero.line1": "Every Calculation.",
  "home.hero.line2": "One Global Home.",
  "home.hero.subtitle":
    "Calculate, convert, compare and understand - in your language, with your country's rules.",
  "home.sections.title": "What's here",
  "home.sections.subtitle": "Six kinds of tool, one consistent way of working.",
  "home.popularCalculators": "Popular calculators",
  "home.popularConverters": "Popular converters",
  "home.categories": "Browse by category",
  "home.countryTools": "Country tools",
  "home.countryTools.subtitle":
    "Tax, salary and duty calculations that follow one country's rules.",
  "home.countryTools.count": "{count} tools currently follow {country} rules.",
  "home.why.title": "Why House of Calculators",
  "home.why.accurate.title": "Shows its working",
  "home.why.accurate.body":
    "Every result comes with the breakdown behind it, the assumptions it made, and what it deliberately leaves out.",
  "home.why.local.title": "Follows your country",
  "home.why.local.body":
    "Currency, number formatting and statutory rules come from the country you choose - which is a separate setting from the language you read in.",
  "home.why.fast.title": "Answers instantly",
  "home.why.fast.body":
    "Calculations run in your browser. There is no waiting on a server between moving a slider and seeing the result.",
  "home.cta.title": "Start with a calculation",
  "home.cta.body": "Browse every calculator, or search for the one you need.",
  "home.cta.button": "Browse calculators",

  /* Calculator page */
  "calc.countryContext": "Country",
  "calc.countryContextHint": "Sets the currency, formatting and rules used below.",
  "calc.breakdownPages": "Breakdown pages",
  "breakdown.monthly": "Monthly",
  "breakdown.yearly": "Yearly",
  "breakdown.fullTerm": "Full term",

  "actions.print": "Print",
  "actions.downloadCsv": "Download CSV",
  "actions.share": "Share",
  "export.item": "Item",
  "export.value": "Value",

  "table.month": "Month",
  "table.payment": "Payment",
  "table.item": "Item",
  "table.amount": "Amount",

  /* Country pages */
  "country.page.title": "{country} Calculators",
  "country.page.desc":
    "Tax, salary and duty calculators that follow {country} rules, rates and currency.",
  "country.page.intro":
    "These tools use {country} statutory rules rather than a generic formula. Each one states the tax year it follows and what it does not cover.",
  "country.tool.title": "{country} {tool}",
  "country.toolCount": "{count} country-specific tools",
  "country.currency": "Currency",
  "country.consumptionTax": "Consumption tax",
  "country.taxYear": "Tax year",
  "country.numberFormat": "Number format",

  /* Converters */
  "conv.from": "From",
  "conv.to": "To",
  "conv.fromUnit": "Convert from",
  "conv.toUnit": "Convert to",
  "conv.swap": "Swap units",
  "conv.rate": "{from} = {to}",
  "conv.formula": "Multiply {from} by {factor} to get {to}.",
  "conv.baseUnit": "Every unit here converts through {unit}, which keeps any pair exact to the same precision.",
  "conv.howItWorks": "How this conversion works",
  "conv.table.title": "{from} to {to} conversion table",
  "conv.popular": "Popular conversions",
  "conv.related": "Other conversions",
  "conv.pair.title": "{from} to {to} Converter",
  "conv.pair.desc": "Convert {from} to {to}, with the conversion factor and a quick reference table.",
  "conv.pair.short": "{from} → {to}",

  "conv.length.title": "Length Converter",
  "conv.length.desc": "Convert between metric and imperial lengths.",
  "conv.length.explain":
    "Every length here is defined against the metre. The imperial units are exact conversions rather than approximations: an inch is defined as 25.4 mm, which makes a foot exactly 0.3048 m.",
  "conv.weight.title": "Weight Converter",
  "conv.weight.desc": "Convert between grams, kilograms, pounds, ounces and stone.",
  "conv.weight.explain":
    "These are units of mass rather than weight in the physics sense. The pound is defined as exactly 0.45359237 kg, so conversions between the metric and imperial units are exact.",
  "conv.temperature.title": "Temperature Converter",
  "conv.temperature.desc": "Convert between Celsius, Fahrenheit and Kelvin.",
  "conv.temperature.explain":
    "Temperature is the one conversion that is not a simple multiplication: Fahrenheit has both a different scale and a different zero point, so its conversion needs an offset as well as a factor.",
  "conv.area.title": "Area Converter",
  "conv.area.desc": "Convert between square metres, feet, acres and hectares.",
  "conv.area.explain":
    "Area units are the square of their length units, which is why the factors are larger than people expect: a square foot is about a tenth of a square metre, not a third.",
  "conv.volume.title": "Volume Converter",
  "conv.volume.desc": "Convert between litres, millilitres, gallons and cups.",
  "conv.volume.explain":
    "US and imperial gallons are different sizes - an imperial gallon is about 20% larger - so a recipe or fuel figure is only meaningful once you know which one it used.",
  "conv.speed.title": "Speed Converter",
  "conv.speed.desc": "Convert between km/h, mph, m/s and knots.",
  "conv.speed.explain":
    "All of these are a distance divided by a time, so converting between them is just converting the distance and the time separately.",
  "conv.data.title": "Data Converter",
  "conv.data.desc": "Convert between bytes, kilobytes, megabytes and their binary equivalents.",
  "conv.data.explain":
    "Decimal prefixes count in thousands and binary prefixes in 1024s. A gigabyte and a gibibyte are not the same size, which is why a drive sold as 1 TB shows up as about 931 GiB.",
  "conv.time.title": "Time Converter",
  "conv.time.desc": "Convert between seconds, minutes, hours, days and years.",
  "conv.time.explain":
    "Months and years vary in length, so those two use the average Gregorian year of 365.2425 days. Anything shorter than a month converts exactly.",
  "conv.energy.title": "Energy Converter",
  "conv.energy.desc": "Convert between joules, calories, kilowatt-hours and BTU.",
  "conv.energy.explain":
    "The calorie on food labels is a kilocalorie - a thousand of the calories used in physics. Both appear here, so check which one your figure is in.",
  "conv.pressure.title": "Pressure Converter",
  "conv.pressure.desc": "Convert between bar, psi, pascals and atmospheres.",
  "conv.pressure.explain":
    "These are all force over area. Tyre pressures are usually quoted as gauge pressure, which is measured relative to the surrounding air rather than to a vacuum.",
  "conv.power.title": "Power Converter",
  "conv.power.desc": "Convert between watts, kilowatts and horsepower.",
  "conv.power.explain":
    "Mechanical horsepower and metric horsepower differ by about 1.4%, which is why the same engine is quoted at slightly different numbers in different markets.",
  "conv.angle.title": "Angle Converter",
  "conv.angle.desc": "Convert between degrees, radians and gradians.",
  "conv.angle.explain":
    "A full turn is 360 degrees, 2π radians or 400 gradians. Radians are the natural unit in maths because the arc length of a unit circle equals the angle.",
  "conv.fuel-economy.title": "Fuel Economy Converter",
  "conv.fuel-economy.desc": "Convert between L/100 km, mpg and km/L.",
  "conv.fuel-economy.explain":
    "L/100 km measures consumption and mpg measures economy, so they run in opposite directions: a lower L/100 km is better, a higher mpg is better. Converting between them means taking a reciprocal, not multiplying.",

  /* Units */
  "unit.length.millimeter": "Millimetre",
  "unit.length.centimeter": "Centimetre",
  "unit.length.meter": "Metre",
  "unit.length.kilometer": "Kilometre",
  "unit.length.inch": "Inch",
  "unit.length.foot": "Foot",
  "unit.length.yard": "Yard",
  "unit.length.mile": "Mile",
  "unit.length.nauticalMile": "Nautical mile",

  "unit.weight.milligram": "Milligram",
  "unit.weight.gram": "Gram",
  "unit.weight.kilogram": "Kilogram",
  "unit.weight.tonne": "Tonne",
  "unit.weight.ounce": "Ounce",
  "unit.weight.pound": "Pound",
  "unit.weight.stone": "Stone",
  "unit.weight.usTon": "US ton",

  "unit.temperature.celsius": "Celsius",
  "unit.temperature.fahrenheit": "Fahrenheit",
  "unit.temperature.kelvin": "Kelvin",

  "unit.area.squareCentimeter": "Square centimetre",
  "unit.area.squareMeter": "Square metre",
  "unit.area.hectare": "Hectare",
  "unit.area.squareKilometer": "Square kilometre",
  "unit.area.squareFoot": "Square foot",
  "unit.area.squareYard": "Square yard",
  "unit.area.acre": "Acre",
  "unit.area.squareMile": "Square mile",

  "unit.volume.milliliter": "Millilitre",
  "unit.volume.liter": "Litre",
  "unit.volume.cubicMeter": "Cubic metre",
  "unit.volume.usGallon": "US gallon",
  "unit.volume.imperialGallon": "Imperial gallon",
  "unit.volume.usCup": "US cup",
  "unit.volume.usFluidOunce": "US fluid ounce",
  "unit.volume.usPint": "US pint",

  "unit.speed.meterPerSecond": "Metres per second",
  "unit.speed.kilometerPerHour": "Kilometres per hour",
  "unit.speed.milePerHour": "Miles per hour",
  "unit.speed.knot": "Knot",
  "unit.speed.footPerSecond": "Feet per second",

  "unit.data.bit": "Bit",
  "unit.data.byte": "Byte",
  "unit.data.kilobyte": "Kilobyte",
  "unit.data.megabyte": "Megabyte",
  "unit.data.gigabyte": "Gigabyte",
  "unit.data.terabyte": "Terabyte",
  "unit.data.kibibyte": "Kibibyte",
  "unit.data.mebibyte": "Mebibyte",
  "unit.data.gibibyte": "Gibibyte",

  "unit.time.millisecond": "Millisecond",
  "unit.time.second": "Second",
  "unit.time.minute": "Minute",
  "unit.time.hour": "Hour",
  "unit.time.day": "Day",
  "unit.time.week": "Week",
  "unit.time.month": "Month",
  "unit.time.year": "Year",

  "unit.energy.joule": "Joule",
  "unit.energy.kilojoule": "Kilojoule",
  "unit.energy.calorie": "Calorie",
  "unit.energy.kilocalorie": "Kilocalorie",
  "unit.energy.wattHour": "Watt-hour",
  "unit.energy.kilowattHour": "Kilowatt-hour",
  "unit.energy.btu": "BTU",

  "unit.pressure.pascal": "Pascal",
  "unit.pressure.kilopascal": "Kilopascal",
  "unit.pressure.bar": "Bar",
  "unit.pressure.psi": "Pounds per square inch",
  "unit.pressure.atmosphere": "Atmosphere",
  "unit.pressure.mmhg": "Millimetres of mercury",

  "unit.power.watt": "Watt",
  "unit.power.kilowatt": "Kilowatt",
  "unit.power.megawatt": "Megawatt",
  "unit.power.horsepower": "Horsepower",
  "unit.power.metricHorsepower": "Metric horsepower",

  "unit.angle.degree": "Degree",
  "unit.angle.radian": "Radian",
  "unit.angle.gradian": "Gradian",
  "unit.angle.arcminute": "Arcminute",

  "unit.fuel.kmPerLiter": "Kilometres per litre",
  "unit.fuel.mpgUs": "Miles per gallon (US)",
  "unit.fuel.mpgImperial": "Miles per gallon (UK)",
  "unit.fuel.litersPer100km": "Litres per 100 km",

  /* Footer */
  "footer.explore": "Explore",
  "footer.popular": "Popular",
  "footer.legal": "Legal",
  "footer.privacy": "Privacy Policy",
  "footer.terms": "Terms of Use",
  "footer.cookies": "Cookies",
  "footer.contact": "Contact",
  "footer.about": "About",
  "footer.disclaimer":
    "{app} tools are for illustration only. Results are estimates, not financial, tax, medical or legal advice. Statutory rates change; verify figures with a qualified professional before acting on them.",

  /* Welcome dialog */
  "gate.title": "Welcome to {app}",
  "gate.subtitle":
    "Two quick choices. The language sets how the site reads; the country sets the currency, formatting and rules the calculations use.",
  "gate.language.subtitle": "Every page is shown in the language you pick.",
  "gate.country.subtitle": "Calculators, currency and tax rules are country specific.",
  "gate.note": "You can change both at any time from the header.",
});

writeFileSync(PATH, `${JSON.stringify(dict, null, 2)}\n`, "utf8");
console.log(`en: ${Object.keys(dict).length} keys total`);
