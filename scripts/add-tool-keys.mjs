/** English copy for the Tools pillar. */
import { readFileSync, writeFileSync } from "node:fs";

const PATH = "src/lib/i18n/dictionaries/en.json";
const dict = JSON.parse(readFileSync(PATH, "utf8"));

Object.assign(dict, {
  "section.tools.intro":
    "Date arithmetic, number utilities and simple planners. Small tools that answer one question properly, rather than a directory of near-identical pages.",

  "category.tools.date-time": "Date & Time",
  "category.tools.number-math": "Numbers & Math",
  "category.tools.utility": "Utilities",
  "category.tools.planning": "Planning",

  "category.tools.date-time.intro":
    "Differences, offsets and week numbers, all calculated in UTC so a daylight-saving change never adds or loses a day.",
  "category.tools.number-math.intro":
    "Percentages, factors, fractions and number formats - the arithmetic worth getting right rather than eyeballing.",
  "category.tools.utility.intro":
    "Random draws and password generation, using the browser's cryptographic generator rather than Math.random.",
  "category.tools.planning.intro":
    "Reaching a savings target and clearing a debt, with the interest included rather than assumed away.",

  "tools.category.title": "{category} Tools",
  "tools.category.desc": "Free {category} tools that run in your browser.",

  /* Shared tool copy */
  "tool.invalidDate": "Enter a valid date.",
  "tool.action.generate": "Generate",
  "tool.option.add": "Add",
  "tool.option.subtract": "Subtract",

  "tool.field.startDate": "Start date",
  "tool.field.endDate": "End date",
  "tool.field.date": "Date",
  "tool.field.birthDate": "Date of birth",
  "tool.field.onDate": "On this date",
  "tool.field.amount": "Amount",
  "tool.field.unit": "Unit",
  "tool.field.direction": "Direction",
  "tool.field.holidays": "Public holidays",
  "tool.field.number": "Number",
  "tool.field.romanNumeral": "Roman numeral",
  "tool.field.numerator": "Numerator",
  "tool.field.denominator": "Denominator",
  "tool.field.min": "Minimum",
  "tool.field.max": "Maximum",
  "tool.field.howMany": "How many",
  "tool.field.unique": "No repeats",
  "tool.field.length": "Length",
  "tool.field.uppercase": "Uppercase letters",
  "tool.field.digits": "Digits",
  "tool.field.symbols": "Symbols",
  "tool.field.target": "Target amount",
  "tool.field.currentSavings": "Current savings",
  "tool.field.monthlyDeposit": "Monthly deposit",
  "tool.field.interestRate": "Interest rate (p.a.)",
  "tool.field.byMonths": "Reach it in (months)",
  "tool.field.balance": "Balance owed",
  "tool.field.monthlyPayment": "Monthly payment",

  "tool.hint.holidays": "Weekdays to subtract, if any fall in the range.",
  "tool.hint.romanRange": "Roman numerals run from 1 to 3999.",
  "tool.hint.byMonths": "Used for the deposit figure below.",

  "units.days": "Days",
  "units.weeks": "Weeks",
  "units.monthsLong": "Months",

  "tool.result.daysBetween": "Days between",
  "tool.result.days": "{count} days",
  "tool.result.calendarSpan": "{years} years, {months} months and {days} days",
  "tool.result.weeks": "Weeks",
  "tool.result.workingDays": "Working days",
  "tool.result.totalDays": "Total days",
  "tool.result.totalWeeks": "Total weeks",
  "tool.result.weekendDays": "Weekend days",
  "tool.result.resultingDate": "Resulting date",
  "tool.result.dayOfWeek": "Day of the week",
  "tool.result.isoDate": "ISO date",
  "tool.result.age": "Age",
  "tool.result.ageValue": "{years} years, {months} months, {days} days",
  "tool.result.nextBirthday": "Next birthday",
  "tool.result.daysToBirthday": "Days until then",
  "tool.result.weekNumber": "Week number",
  "tool.result.weekValue": "Week {week} of {year}",
  "tool.result.dayOfYear": "Day of the year",
  "tool.result.inWords": "In words",
  "tool.result.formatted": "Formatted",
  "tool.result.asRoman": "As a Roman numeral",
  "tool.result.asNumber": "As a number",
  "tool.result.outOfRange": "Out of range",
  "tool.result.invalidNumeral": "Not a valid numeral",
  "tool.result.isPrime": "Is it prime?",
  "tool.result.primeExplain": "{value} has no divisors other than 1 and itself.",
  "tool.result.notPrimeExplain": "It factorises as {factors}.",
  "tool.result.primeFactors": "Prime factors",
  "tool.result.divisorCount": "Number of divisors",
  "tool.result.divisors": "Divisors",
  "tool.result.simplified": "Simplified",
  "tool.result.divideByZero": "A denominator cannot be zero",
  "tool.result.asDecimal": "As a decimal",
  "tool.result.asPercent": "As a percentage",
  "tool.result.gcd": "Greatest common divisor",
  "tool.result.lcm": "Lowest common multiple",
  "tool.result.random": "Result",
  "tool.result.notEnoughNumbers": "The range is too small for that many unique numbers",
  "tool.result.password": "Password",
  "tool.result.entropy": "About {bits} bits of entropy",
  "tool.result.timeToGoal": "Time to reach the goal",
  "tool.result.monthsValue": "{months} months (about {years} years)",
  "tool.result.notReachable": "Not reachable at this rate",
  "tool.result.totalDeposited": "Total deposited",
  "tool.result.interestEarned": "Interest earned",
  "tool.result.depositNeeded": "Monthly deposit to finish in {months} months",
  "tool.result.timeToClear": "Time to clear the debt",
  "tool.result.neverClears": "The balance never clears",
  "tool.result.neverClearsDetail":
    "The payment is smaller than the interest charged each month, so the balance grows instead of falling.",
  "tool.result.totalInterest": "Total interest",
  "tool.result.totalPaid": "Total paid",
  "tool.result.interestShare": "Share of payments that is interest",

  "common.yes": "Yes",
  "common.no": "No",

  "tool.note.englishOnly":
    "Spelled in English. Writing numbers correctly in other languages follows different rules, so this tool does not guess at them.",
  "tool.note.passwordPrivacy":
    "Generated in your browser using its cryptographic random number generator. Nothing is sent anywhere, and nothing is stored.",

  /* Individual tools */
  "tool.date-difference.title": "Date Difference Calculator",
  "tool.date-difference.desc": "Count the days, weeks and working days between two dates.",
  "tool.date-difference.explain":
    "The difference is counted in whole days in UTC. Using local time would make the answer wrong across a daylight-saving change, where two dates can be 23 or 25 hours apart.",

  "tool.add-days.title": "Add or Subtract Days",
  "tool.add-days.desc": "Find the date a number of days, weeks or months away.",
  "tool.add-days.explain":
    "Adding months clamps rather than rolls over: one month after 31 January is 28 February, not 3 March. Adding days and weeks is exact.",

  "tool.working-days.title": "Working Days Calculator",
  "tool.working-days.desc": "Count business days between two dates, excluding weekends.",
  "tool.working-days.explain":
    "Saturdays and Sundays are excluded and both endpoints are counted. Public holidays vary by country and region, so they are yours to subtract rather than assumed.",

  "tool.age.title": "Age Calculator",
  "tool.age.desc": "Work out an exact age in years, months and days.",
  "tool.age.explain":
    "Age is counted in calendar terms rather than by dividing days by 365.25, so it matches the way birthdays actually work, including across leap years.",

  "tool.week-number.title": "Week Number Calculator",
  "tool.week-number.desc": "Find the ISO week number for any date.",
  "tool.week-number.explain":
    "ISO 8601 weeks start on Monday, and week 1 is the week containing 4 January. That is why the first days of January sometimes fall in week 52 or 53 of the previous year.",

  "tool.percentage.title": "Percentage Calculator",
  "tool.percentage.desc": "Percentage of a value, share, change and increases.",
  "tool.percentage.explain":
    "Four different questions get asked as “percentage”, and they have different formulas. Picking the right one first is most of the work.",
  "tool.pct.mode": "Question",
  "tool.pct.mode.of": "% of a value",
  "tool.pct.mode.share": "A is what % of B",
  "tool.pct.mode.change": "% change",
  "tool.pct.mode.apply": "Increase / decrease",
  "tool.pct.percent": "Percentage",
  "tool.pct.value": "Value",
  "tool.pct.part": "Part",
  "tool.pct.whole": "Whole",
  "tool.pct.from": "From",
  "tool.pct.to": "To",
  "tool.pct.result.of": "Result",
  "tool.pct.result.share": "Share",
  "tool.pct.result.change": "Change",
  "tool.pct.result.apply": "New value",

  "tool.number-to-words.title": "Number to Words",
  "tool.number-to-words.desc": "Spell a number out, the way an amount is written on a cheque.",
  "tool.number-to-words.explain":
    "Numbers are spelled using the short scale, where a billion is a thousand million, and hundreds are joined with “and” in the British style.",

  "tool.roman-numerals.title": "Roman Numeral Converter",
  "tool.roman-numerals.desc": "Convert numbers to Roman numerals and back.",
  "tool.roman-numerals.explain":
    "Standard subtractive notation is used, so 9 is IX rather than VIIII. Input is checked by converting it back: IIII and IC are rejected as malformed rather than guessed at.",

  "tool.prime-checker.title": "Prime Number Checker",
  "tool.prime-checker.desc": "Check whether a number is prime and see its factors.",
  "tool.prime-checker.explain":
    "Divisors are tested only up to the square root: any factor above it pairs with one below, so there is nothing left to find beyond that point.",

  "tool.fraction-simplifier.title": "Fraction Simplifier",
  "tool.fraction-simplifier.desc": "Reduce a fraction and see it as a decimal and a percentage.",
  "tool.fraction-simplifier.explain":
    "A fraction is reduced by dividing both parts by their greatest common divisor, which is found with the Euclidean algorithm.",

  "tool.random-number.title": "Random Number Generator",
  "tool.random-number.desc": "Draw random numbers in a range, with or without repeats.",
  "tool.random-number.explain":
    "Numbers come from the browser's cryptographic generator, and draws outside a whole multiple of the range are discarded. Taking a simple remainder would make the lowest numbers slightly more likely.",

  "tool.password-generator.title": "Password Generator",
  "tool.password-generator.desc": "Generate a strong random password in your browser.",
  "tool.password-generator.explain":
    "Characters are drawn uniformly from the sets you enable. Look-alike characters such as l, I, 1, O and 0 are left out, because a password you cannot read back is a password you will write down.",

  "tool.savings-goal.title": "Savings Goal Planner",
  "tool.savings-goal.desc": "See how long a savings target takes, and what it takes to hit a date.",
  "tool.savings-goal.explain":
    "Interest compounds monthly on the running balance, including the deposits already made. The answer is how long the target takes at that deposit, and what deposit would reach it by your chosen month.",

  "tool.debt-payoff.title": "Debt Payoff Planner",
  "tool.debt-payoff.desc": "See how long a debt takes to clear and what the interest costs.",
  "tool.debt-payoff.explain":
    "Interest is charged on the outstanding balance each month before the payment is applied. If the payment is smaller than that interest the balance grows, and the planner says so rather than returning a number.",
});

writeFileSync(PATH, `${JSON.stringify(dict, null, 2)}\n`, "utf8");
console.log(`en: ${Object.keys(dict).length} keys`);
