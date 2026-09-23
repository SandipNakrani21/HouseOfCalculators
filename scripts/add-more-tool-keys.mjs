/** English copy for the nine tools added to complete spec §4. */
import { readFileSync, writeFileSync } from "node:fs";

const PATH = "src/lib/i18n/dictionaries/en.json";
const dict = JSON.parse(readFileSync(PATH, "utf8"));

Object.assign(dict, {
  "weekday.sunday": "Sunday",
  "weekday.monday": "Monday",
  "weekday.tuesday": "Tuesday",
  "weekday.wednesday": "Wednesday",
  "weekday.thursday": "Thursday",
  "weekday.friday": "Friday",
  "weekday.saturday": "Saturday",

  // ------------------------------------------------------------ day of week
  "tool.day-of-week.title": "Day of the Week",
  "tool.day-of-week.desc": "What day any date fell on, with its week and day numbers.",
  "tool.day-of-week.explain":
    "Dates are handled in UTC, so the answer does not shift with your time zone or a daylight-saving change. The ISO week runs Monday to Sunday and week 1 is the one containing 4 January, which is why early January can belong to the previous ISO year.",
  "tool.result.dayOfWeek": "Day of the week",
  "tool.result.isoWeek": "ISO week",
  "tool.result.dayOfYear": "Day of the year",
  "tool.result.isWeekend": "Weekend",
  "tool.result.fromToday": "From today",
  "tool.result.daysValue": "{days} days",

  // --------------------------------------------------------------- countdown
  "tool.countdown.title": "Countdown Timer",
  "tool.countdown.desc": "Days, hours and minutes until a date — or since one that has passed.",
  "tool.countdown.explain":
    "The target is midnight UTC on the date you pick, and the clock ticks once a second. A date in the past counts up instead of down rather than showing a negative.",
  "tool.field.targetDate": "Target date",
  "tool.hint.countdownUtc": "Counted to midnight UTC on that date.",
  "tool.result.timeUntil": "Time until",
  "tool.result.timeSince": "Time since",
  "tool.result.countdownValue": "{days}d {hours}:{minutes}:{seconds}",
  "tool.result.totalDays": "Total days",
  "tool.result.totalHours": "Total hours",
  "tool.result.totalMinutes": "Total minutes",
  "tool.result.totalWeeks": "Total weeks",

  // --------------------------------------------------------- words to number
  "tool.words-to-number.title": "Words to Number",
  "tool.words-to-number.desc": "Turn a number written in English words back into digits.",
  "tool.words-to-number.explain":
    "This is the inverse of the number-to-words tool. It understands the short scale — a billion is a thousand million — and treats \"and\" as decoration, so \"one hundred and one\" and \"one hundred one\" both give 101.",
  "tool.field.numberWords": "Number in words",
  "tool.hint.numberWords": "For example: one thousand two hundred and thirty-four.",
  "tool.result.number": "Number",
  "tool.result.wordsUnreadable":
    "That is not a number this tool can read. Try words only, such as \"forty-two\".",
  "tool.result.wordsRoundTrip": "Written back out: {words}",

  // ----------------------------------------------------------- factor finder
  "tool.factor-finder.title": "Factor Finder",
  "tool.factor-finder.desc": "Every divisor of a number, its prime factors, and the GCD and LCM of a pair.",
  "tool.factor-finder.explain":
    "Divisors are every whole number that divides yours exactly. Prime factors are the primes that multiply back to it, and every number has exactly one such set. The GCD is the largest number dividing both of yours, and the LCM the smallest that both divide into.",
  "tool.field.secondNumber": "Second number",
  "tool.hint.secondNumber": "Used for the GCD and LCM.",
  "tool.result.factorDetail": "Prime factorisation: {factors}",
  "tool.result.gcd": "GCD (HCF)",
  "tool.result.lcm": "LCM",

  // -------------------------------------------------------- number formatter
  "tool.number-formatter.title": "Number Formatter",
  "tool.number-formatter.desc": "One number written every way this site can write it.",
  "tool.number-formatter.explain":
    "Grouping follows the country you have selected. India groups in lakh and crore — 30,00,000 rather than 3,000,000 — which is exactly the difference this tool exists to show.",
  "tool.field.decimals": "Decimal places",
  "tool.result.formatted": "Formatted",
  "tool.result.formattedIn": "Formatted for {locale}.",
  "tool.result.currencyForm": "As currency",
  "tool.result.shortForm": "Abbreviated",
  "tool.result.inWords": "In words",
  "tool.result.scientific": "Scientific notation",

  // ------------------------------------------------------------ dice roller
  "tool.dice-roller.title": "Dice Roller",
  "tool.dice-roller.desc": "Roll any number of dice, from d4 to d100.",
  "tool.dice-roller.explain":
    "Rolls come from your browser's cryptographic random generator using rejection sampling, so every face is equally likely. The ordinary shortcut of taking a remainder makes the lowest faces very slightly more common, which is the last thing a dice roller should do.",
  "tool.field.diceCount": "How many dice",
  "tool.field.diceSides": "Sides",
  "tool.action.roll": "Roll",
  "tool.result.rolls": "Rolls",
  "tool.result.highest": "Highest",
  "tool.result.lowest": "Lowest",
  "tool.result.average": "Average",

  // -------------------------------------------------------------- coin flip
  "tool.coin-flip.title": "Coin Flip",
  "tool.coin-flip.desc": "Flip a fair coin once, or a thousand times at once.",
  "tool.coin-flip.explain":
    "Each flip is drawn independently from the same cryptographic generator the dice use. Over many flips the split drifts towards half and half, but it very rarely lands exactly there — which is what a fair coin actually looks like.",
  "tool.field.flipCount": "How many flips",
  "tool.action.flip": "Flip",
  "tool.result.flip": "Result",
  "tool.result.heads": "Heads",
  "tool.result.tails": "Tails",
  "tool.result.headsShare": "Heads share",
  "tool.result.flipDetail": "{heads} heads and {tails} tails.",

  // ---------------------------------------------------------- random picker
  "tool.random-picker.title": "Random Picker",
  "tool.random-picker.desc": "Pick a name, shuffle an order, or split a list into teams.",
  "tool.random-picker.explain":
    "Shuffling uses Fisher-Yates with the cryptographic generator, which gives every ordering an equal chance. Sorting by a random comparison — the usual one-line trick — does not, and produces a noticeably skewed order. Teams are filled one at a time round the group, so eleven people across three teams gives 4, 4 and 3 rather than piling the remainder onto the last team.",
  "tool.field.names": "Names or items",
  "tool.hint.names": "One per line, or separated by commas.",
  "tool.field.teamCount": "Number of teams",
  "tool.action.pickOne": "Pick one",
  "tool.action.shuffle": "Shuffle order",
  "tool.action.makeTeams": "Make teams",
  "tool.result.picked": "Picked",
  "tool.result.team": "Team {number}",
  "tool.hint.entryCount": "{count} entries.",

  // -------------------------------------------------------- budget planner
  "tool.budget-planner.title": "Budget Planner",
  "tool.budget-planner.desc": "Split your monthly income across needs, wants and savings.",
  "tool.budget-planner.explain":
    "The default 50/30/20 split is a starting point, not a rule: half for needs, a third for wants, a fifth saved. Adjust the percentages to whatever your circumstances allow — in an expensive city the needs share is usually higher, and the useful question is what that leaves rather than whether it matches the template.",
  "tool.field.monthlyIncome": "Monthly income",
  "tool.hint.afterTax": "After tax — what actually lands in your account.",
  "budget.needs": "Needs",
  "budget.wants": "Wants",
  "budget.savings": "Savings",
  "tool.result.leftOver": "Unallocated",
  "tool.result.budgetBalanced": "Your percentages add to 100%.",
  "tool.result.budgetUnbalanced": "Your percentages add to {total}%, not 100%.",
  "tool.result.savingsPerYear": "Saved per year",
});

writeFileSync(PATH, `${JSON.stringify(dict, null, 2)}\n`, "utf8");
console.log(`en.json now defines ${Object.keys(dict).length} keys.`);
