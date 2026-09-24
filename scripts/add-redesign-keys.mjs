/**
 * English copy for the redesign: header strip, search dialog, footer and the
 * new landing page.
 *
 * Written against what the site actually is. The design comp carried figures
 * this site cannot claim ("1,000+ calculators", "10+ languages", "millions of
 * users"); every count here is computed from the registries at render time
 * and passed in as a placeholder, so it stays true as the site grows.
 */
import { readFileSync, writeFileSync } from "node:fs";

const PATH = "src/lib/i18n/dictionaries/en.json";
const dict = JSON.parse(readFileSync(PATH, "utf8"));

Object.assign(dict, {
  // Header strip and search dialog
  "header.strip.tagline": "A global platform for everyday calculations",
  "header.strip.fast": "Fast",
  "header.strip.free": "Free",
  "header.strip.accurate": "Accurate",
  "header.strip.private": "Private",
  "header.searchTitle": "Search calculators, converters and guides",
  "header.searchHint": "Tip: press / or Ctrl+K anywhere to search. Use ↑ ↓ and Enter to pick a result.",

  // Footer
  "footer.brandBlurb":
    "Free calculators, converters and guides that follow your country's currency, units and rules. Every calculation runs on your device.",
  "footer.support": "Support",
  "footer.motto": "Calculate • Convert • Compare • Understand",

  // Hero
  "home.hero.badge": "{calculators} calculators • {countries} countries • Free to use",
  "home.hero.tagline": "Simple. Accurate. Useful. For everyone.",
  "home.hero.body":
    "House of Calculators helps you calculate, convert and solve everyday problems with easy-to-use tools. From finance to health, education to engineering — find the right calculator in seconds.",
  "home.hero.popular": "Popular:",
  "home.hero.art.title": "Calculate",
  "home.hero.art.subtitle": "A Smarter Tomorrow",
  "home.hero.script.1": "Simple Tools",
  "home.hero.script.2": "Big Possibilities",

  "home.chip.loan": "Loan",
  "home.chip.mortgage": "Mortgage",
  "home.chip.bmi": "BMI",
  "home.chip.age": "Age",
  "home.chip.percentage": "Percentage",
  "home.chip.sip": "SIP",
  "home.chip.discount": "Discount",
  "home.chip.bmr": "BMR",

  // Stats strip
  "home.stats.calculators": "Calculators",
  "home.stats.tools": "Converters & tools",
  "home.stats.countries": "Countries supported",
  "home.stats.free": "Free & private",

  // Categories
  "home.categories.title": "Explore Calculators by Category",
  "home.categories.viewAll": "View all categories",
  "home.cat.finance.examples": "EMI, mortgage, SIP, tax and more",
  "home.cat.health.examples": "BMI, BMR, calories and more",
  "home.cat.math.examples": "Statistics, ratio, equations and more",
  "home.cat.education.examples": "GPA, grades, final score and more",
  "home.cat.business.examples": "Profit, ROI, margin and more",
  "home.cat.everyday.examples": "Discount, fuel, tips and more",
  "home.cat.construction.examples": "Concrete, paint, tiles and more",
  "home.cat.engineering.examples": "Ohm's law, force, torque and more",

  // Popular
  "home.popular.title": "Popular Calculators",
  "home.popular.viewAll": "View all calculators",

  // More ways
  "home.more.title": "More Ways to Calculate",
  "home.more.subtitle": "Converters, everyday tools, reference tables and step-by-step guides — all linked to the calculators they support.",

  // Why choose
  "home.why.eyebrow": "Why choose",
  "home.why.heading": "{app}?",
  "home.why.fast.title": "Fast & accurate",
  "home.why.fast.body": "Answers update as you type — no waiting, no page reloads.",
  "home.why.free.title": "100% free",
  "home.why.free.body": "No sign-up, and your numbers never leave your device.",
  "home.why.global.title": "Built for {count} countries",
  "home.why.global.body": "Currency, units and tax rules that follow your country.",
  "home.why.device.title": "Works on any device",
  "home.why.device.body": "Desktop, tablet or mobile — the same tools everywhere.",
  "home.device.title.1": "Calculate",
  "home.device.title.2": "Without Limits",
  "home.device.search": "Search calculators…",
  "home.device.loanAmount": "Loan amount",
  "home.device.rate": "Interest rate",
  "home.device.tenure": "Loan tenure",
  "home.device.button": "Calculate",

  // Countries
  "home.world.title": "Built for Every Country",
  "home.world.subtitle":
    "Currency, number formats, units and statutory rules for {count} countries — and the language you read in is a separate choice.",
  "home.world.button": "Find tools for your country",
  "home.world.more": "More",

  // Guides
  "home.guides.title": "Guides & Tips",
  "home.guides.viewAll": "View all guides",
  "home.guides.read": "Read more",

  // Call to action
  "home.cta.title": "Ready to start calculating?",
  "home.cta.body": "Free, instant and private — no sign-up, no downloads, nothing sent to a server.",
  "home.cta.button": "Explore all calculators",
});

writeFileSync(PATH, `${JSON.stringify(dict, null, 2)}\n`, "utf8");
console.log(`en.json now defines ${Object.keys(dict).length} keys.`);
