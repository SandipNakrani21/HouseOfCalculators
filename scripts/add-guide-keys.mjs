/** English copy for the Guides pillar. */
import { readFileSync, writeFileSync } from "node:fs";

const PATH = "src/lib/i18n/dictionaries/en.json";
const dict = JSON.parse(readFileSync(PATH, "utf8"));

Object.assign(dict, {
  "section.guides.intro":
    "How the numbers are actually worked out. Each guide gives the formula, what every symbol means, a worked example with real figures, and the calculator that does it for you.",

  "category.guides.how-to-calculate": "How to calculate",
  "category.guides.what-is": "What is",
  "category.guides.formulas": "Formulas",
  "category.guides.practical": "Practical guides",

  "category.guides.how-to-calculate.intro":
    "Step-by-step walkthroughs with the formula and a worked example, so you can follow the arithmetic rather than trust it.",
  "category.guides.what-is.intro":
    "Plain explanations of the terms that show up in financial calculations, written for someone meeting them for the first time.",
  "category.guides.formulas.intro":
    "The formulas themselves: what each symbol means, why the formula is shaped the way it is, and where it breaks down.",
  "category.guides.practical.intro":
    "How to use these numbers to make a decision, rather than just produce one.",

  "guides.category.title": "{category}",
  "guides.category.desc": "Guides: {category}.",
  "guide.steps": "Step by step",
  "guide.workedExample": "Worked example",
  "guide.worthKnowing": "Worth knowing",
  "guide.useTheTool": "Use the calculator",
  "guide.moreGuides": "More guides",
  "guide.reviewed": "Last reviewed {date}",

  /* Loan payment */
  "guide.loan-payment.title": "How to Calculate a Loan Payment",
  "guide.loan-payment.desc":
    "The formula behind a monthly loan payment, worked through with real numbers.",
  "guide.loan-payment.intro.1":
    "A level-payment loan charges interest on whatever you still owe, then takes a fixed amount off each month. The payment has to be large enough to cover that month's interest and still chip away at the balance, and it has to be the same every month until the loan clears.",
  "guide.loan-payment.intro.2":
    "That constraint is what produces the formula below. It looks awkward, but it is just the payment that makes the balance land on exactly zero at the end of the term.",
  "guide.loan-payment.var.payment": "The monthly payment you are solving for.",
  "guide.loan-payment.var.amount": "The amount borrowed, after any deposit.",
  "guide.loan-payment.var.rate": "The monthly interest rate: the annual rate divided by 12, as a decimal.",
  "guide.loan-payment.var.periods": "The number of monthly payments, so years times 12.",
  "guide.loan-payment.step.1":
    "Convert the annual rate to a monthly one by dividing by 12, then by 100 to make it a decimal. A 6% loan gives 0.005.",
  "guide.loan-payment.step.2":
    "Count the payments. A 25-year loan paid monthly is 300 payments.",
  "guide.loan-payment.step.3":
    "Work out (1 + i)ⁿ - the growth factor over the whole term. This is the part a calculator is genuinely useful for.",
  "guide.loan-payment.step.4":
    "Put the numbers into the formula. The result is the payment that clears the loan exactly on schedule.",
  "guide.loan-payment.example.intro":
    "A 200,000 loan at 6% over 25 years, in whatever currency you like - the arithmetic is the same.",
  "guide.loan-payment.example.amount": "Amount borrowed (A)",
  "guide.loan-payment.example.rate": "Monthly rate (i)",
  "guide.loan-payment.example.periods": "Number of payments (n)",
  "guide.loan-payment.example.growth": "Growth factor (1 + i)ⁿ",
  "guide.loan-payment.example.result": "Monthly payment",
  "guide.loan-payment.note.1":
    "The total paid over 25 years is about 386,580 - so the interest costs more than 90% of the amount borrowed again. That is the number worth looking at when comparing terms, not the monthly payment alone.",
  "guide.loan-payment.note.2":
    "This assumes the rate never changes. On a variable or tracker rate the payment is recalculated whenever the rate moves, so treat the result as the payment at today's rate rather than a fixed commitment.",
  "guide.loan-payment.faq.1.q": "Why is the formula not just the amount divided by the months, plus interest?",
  "guide.loan-payment.faq.1.a":
    "Because the interest is charged on the balance, and the balance falls every month. A fixed share of interest would overcharge at the end, when far less is owed.",
  "guide.loan-payment.faq.2.q": "What happens if I pay more than the payment?",
  "guide.loan-payment.faq.2.a":
    "The extra goes straight to the balance. Since interest is charged on the balance, every unit you overpay also removes all the interest that would have accrued on it for the rest of the term.",

  /* Compound interest */
  "guide.compound.title": "How to Calculate Compound Interest",
  "guide.compound.desc": "The compound interest formula, and what each part of it does.",
  "guide.compound.intro.1":
    "Simple interest pays you on what you originally put in. Compound interest pays you on the interest as well, so each period starts from a slightly larger number than the last.",
  "guide.compound.intro.2":
    "How often that happens matters. The same annual rate compounded monthly beats the same rate compounded yearly, because the interest starts earning sooner.",
  "guide.compound.var.final": "The final amount, including the original sum.",
  "guide.compound.var.principal": "The amount you start with.",
  "guide.compound.var.rate": "The annual rate as a decimal: 6% is 0.06.",
  "guide.compound.var.frequency": "How many times a year interest is added.",
  "guide.compound.var.years": "The number of years.",
  "guide.compound.step.1":
    "Divide the annual rate by the compounding frequency. That is the rate applied each period.",
  "guide.compound.step.2":
    "Multiply the frequency by the years to get the number of periods.",
  "guide.compound.step.3":
    "Raise (1 + period rate) to that power and multiply by the starting amount.",
  "guide.compound.example.intro": "10,000 at 6% a year, compounded monthly, for 10 years.",
  "guide.compound.example.principal": "Principal (P)",
  "guide.compound.example.rate": "Annual rate (r)",
  "guide.compound.example.frequency": "Compounds per year (n)",
  "guide.compound.example.years": "Years (t)",
  "guide.compound.example.result": "Final amount",
  "guide.compound.note.1":
    "Compounded yearly instead of monthly, the same deposit reaches about 17,908 - roughly 286 less. The rate is identical; only the timing changed.",
  "guide.compound.faq.1.q": "What is the rule of 72?",
  "guide.compound.faq.1.a":
    "Dividing 72 by the interest rate gives a rough number of years for money to double. At 6% that is about 12 years, and the real answer is 11.9 - close enough for mental arithmetic.",
  "guide.compound.faq.2.q": "Does this account for tax or fees?",
  "guide.compound.faq.2.a":
    "No. Both reduce the effective rate, so the honest way to use the formula is to put your after-tax, after-fee rate into it rather than the headline one.",

  /* Percentage */
  "guide.percentage.title": "How to Calculate a Percentage",
  "guide.percentage.desc":
    "Percentage of a value, percentage change, and why the two are not the same.",
  "guide.percentage.intro.1":
    "A percentage is just a fraction with 100 on the bottom. The difficulty is almost never the arithmetic - it is that several different questions all get called “percentage”.",
  "guide.percentage.intro.2":
    "The most error-prone one is percentage change, because the answer depends on which number you start from. Going from 80 to 100 is a 25% increase, but going from 100 back to 80 is a 20% decrease.",
  "guide.percentage.var.old": "The starting value - the one you are measuring from.",
  "guide.percentage.var.new": "The ending value.",
  "guide.percentage.step.1": "Subtract the old value from the new one to get the difference.",
  "guide.percentage.step.2": "Divide that difference by the old value, not the new one.",
  "guide.percentage.step.3": "Multiply by 100.",
  "guide.percentage.example.intro": "A price rises from 80 to 100.",
  "guide.percentage.example.old": "Old value",
  "guide.percentage.example.new": "New value",
  "guide.percentage.example.difference": "Difference",
  "guide.percentage.example.result": "Percentage change",
  "guide.percentage.note.1":
    "A rise and a fall of the same percentage do not cancel out. Lose 50% and you need a 100% gain to get back, because the second percentage is taken from a smaller base.",
  "guide.percentage.faq.1.q": "What is the difference between percent and percentage points?",
  "guide.percentage.faq.1.a":
    "If a rate goes from 4% to 5%, that is a rise of one percentage point but a 25% increase. Reports use whichever sounds more dramatic, so it is worth checking which is meant.",
  "guide.percentage.faq.2.q": "How do I reverse a percentage increase?",
  "guide.percentage.faq.2.a":
    "Divide rather than subtract. To remove a 20% increase, divide by 1.20 - subtracting 20% would take off too much, because it would be 20% of the larger number.",

  /* VAT */
  "guide.vat.title": "How to Calculate VAT",
  "guide.vat.desc": "Adding VAT to a price, and working it back out of one.",
  "guide.vat.intro.1":
    "Adding VAT is straightforward: multiply by one plus the rate. Removing it is where people go wrong, because subtracting the rate from the gross price takes off too much.",
  "guide.vat.intro.2":
    "The reason is that the tax was calculated on the net price, not the gross one. 20% of the net is less than 20% of the gross, so reversing it means dividing, not subtracting.",
  "guide.vat.var.net": "The price before tax.",
  "guide.vat.var.gross": "The price the customer pays.",
  "guide.vat.var.rate": "The tax rate as a decimal: 20% is 0.20.",
  "guide.vat.step.1": "To add tax, multiply the net price by one plus the rate.",
  "guide.vat.step.2":
    "To remove it, divide the gross price by one plus the rate. The tax is the difference.",
  "guide.vat.example.intro": "A price of 120.00 including 20% VAT.",
  "guide.vat.example.gross": "Gross price",
  "guide.vat.example.rate": "Divisor",
  "guide.vat.example.net": "Net price",
  "guide.vat.example.result": "VAT included in the price",
  "guide.vat.note.1":
    "Subtracting 20% from 120 gives 96, which is wrong by four units. The mistake is common enough on invoices that it is worth checking the arithmetic rather than the label.",
  "guide.vat.faq.1.q": "What is the VAT fraction?",
  "guide.vat.faq.1.a":
    "A shortcut for pulling tax straight out of a gross price. At 20% it is 1/6, so a sixth of 120 is 20. It is the same division written differently.",
  "guide.vat.faq.2.q": "Do all goods carry the standard rate?",
  "guide.vat.faq.2.a":
    "No. Most countries have reduced and zero rates for things like food, books, children's clothing and public transport. The rate depends on what is sold, not on who sells it.",

  /* What is: compound interest */
  "guide.what-compound.title": "What Is Compound Interest?",
  "guide.what-compound.desc": "What compounding means, and why time matters more than rate.",
  "guide.what-compound.intro.1":
    "Compound interest is interest that earns interest. Put money somewhere that pays 5%, and in the second year you earn 5% on your original amount plus 5% on the first year's interest.",
  "guide.what-compound.intro.2":
    "Over a year or two the difference against simple interest is barely visible. Over decades it dominates everything else, which is why the number of years usually matters more than squeezing out an extra percentage point.",
  "guide.what-compound.intro.3":
    "The same mechanism works against you on debt. A credit card balance compounds monthly at a high rate, which is why a minimum payment can leave a balance almost unchanged for years.",
  "guide.what-compound.note.1":
    "Compounding frequency matters less than people expect. Going from yearly to monthly compounding at 6% adds about 0.17 percentage points of effective return; going from 10 years to 20 roughly doubles the outcome.",
  "guide.what-compound.note.2":
    "Inflation compounds too. A 6% return with 3% inflation is closer to 3% in real terms, and it is the real number that decides what the money will buy.",
  "guide.what-compound.faq.1.q": "Is compound interest always better than simple interest?",
  "guide.what-compound.faq.1.a":
    "For money you are owed, yes. For money you owe, it is the opposite: compounding is exactly what makes a long-running debt expensive.",
  "guide.what-compound.faq.2.q": "What does APY mean?",
  "guide.what-compound.faq.2.a":
    "Annual percentage yield: the rate after compounding is taken into account. It lets you compare accounts that compound at different frequencies on equal terms.",

  /* What is: amortisation */
  "guide.what-amortisation.title": "What Is Amortisation?",
  "guide.what-amortisation.desc": "How a loan balance unwinds, and why early payments feel wasted.",
  "guide.what-amortisation.intro.1":
    "Amortisation is the process of paying a loan off in equal instalments, where each payment covers that month's interest first and puts whatever is left towards the balance.",
  "guide.what-amortisation.intro.2":
    "Because interest is charged on the outstanding balance, early payments are mostly interest. As the balance falls, the interest portion shrinks and the principal portion grows, so the loan clears faster and faster towards the end.",
  "guide.what-amortisation.intro.3":
    "On a 25-year mortgage, the point where more than half of each payment finally goes to principal arrives around year nine - which surprises most borrowers.",
  "guide.what-amortisation.note.1":
    "This is why overpaying early is worth far more than overpaying late. A unit paid in year one removes 24 years of interest that would have accrued on it; the same unit in year 24 removes almost none.",
  "guide.what-amortisation.faq.1.q": "Why does my balance barely move in the first year?",
  "guide.what-amortisation.faq.1.a":
    "Because the balance is at its highest, so the interest charged is at its highest too. Most of the payment is covering that interest rather than reducing what you owe.",
  "guide.what-amortisation.faq.2.q": "Is an interest-only loan amortising?",
  "guide.what-amortisation.faq.2.a":
    "No. An interest-only payment covers the interest and nothing else, so the balance stays where it is until you repay it some other way.",

  /* What is: inflation */
  "guide.what-inflation.title": "What Is Inflation?",
  "guide.what-inflation.desc": "What inflation does to money that is not doing anything.",
  "guide.what-inflation.intro.1":
    "Inflation is a general rise in prices, which is the same thing as a fall in what a unit of money buys. If prices rise 3% this year, the same note buys about 3% less than it did.",
  "guide.what-inflation.intro.2":
    "It compounds, exactly like interest. At 3% a year, money loses about a quarter of its purchasing power over a decade and around 45% over twenty years.",
  "guide.what-inflation.intro.3":
    "This is why a long-term plan has to be stated in real terms. A retirement target that looks generous in today's money can be uncomfortable by the time you reach it.",
  "guide.what-inflation.note.1":
    "Your personal inflation rate is not the headline one. The published figure is an average across a basket of goods; if your spending is weighted towards rent or energy, your experience can be very different.",
  "guide.what-inflation.faq.1.q": "What is the difference between nominal and real returns?",
  "guide.what-inflation.faq.1.a":
    "Nominal is the number quoted; real is what is left after inflation. A 5% return with 3% inflation is about 2% real, and it is the real figure that decides what you can buy.",
  "guide.what-inflation.faq.2.q": "Is deflation better?",
  "guide.what-inflation.faq.2.a":
    "Not usually. Falling prices sound good for savers, but they encourage people to delay spending, which reduces demand and tends to make debt harder to repay.",

  /* What is: marginal rate */
  "guide.what-marginal.title": "What Is a Marginal Tax Rate?",
  "guide.what-marginal.desc":
    "Why moving into a higher tax bracket does not cut your take-home pay.",
  "guide.what-marginal.intro.1":
    "Your marginal rate is the rate charged on your next unit of income. Your effective rate is the total tax divided by your total income. They are almost never the same number.",
  "guide.what-marginal.intro.2":
    "That is because tax bands are sliced, not switched. Income inside each band is taxed at that band's rate; only the part above a threshold pays the higher rate.",
  "guide.what-marginal.intro.3":
    "So earning one unit more never leaves you worse off overall. The extra unit is taxed more heavily, but everything below the threshold carries on being taxed exactly as before.",
  "guide.what-marginal.note.1":
    "There are real exceptions, and they come from benefits and allowances rather than the bands themselves - a tapered allowance or a withdrawn credit can create a spike in the effective marginal rate over a narrow range of income.",
  "guide.what-marginal.faq.1.q": "Will a pay rise push me into a higher bracket and cost me money?",
  "guide.what-marginal.faq.1.a":
    "Not from the bands alone. Only the income above the threshold is taxed at the higher rate, so more gross pay always means more net pay.",
  "guide.what-marginal.faq.2.q": "Which rate should I use for a decision?",
  "guide.what-marginal.faq.2.a":
    "The marginal rate, for anything that changes your income at the edges - a bonus, overtime, or a pension contribution. The effective rate is for understanding the total bill.",

  /* Practical: compare loans */
  "guide.compare-loans.title": "How to Compare Loan Offers",
  "guide.compare-loans.desc": "What to compare when two offers have different rates and terms.",
  "guide.compare-loans.intro.1":
    "A lower monthly payment is not a cheaper loan. Stretching the same amount over more years reduces the payment and increases the total interest, often substantially.",
  "guide.compare-loans.intro.2":
    "Comparing properly means holding one thing constant and looking at the total cost rather than the instalment.",
  "guide.compare-loans.step.1":
    "Work out the total paid for each offer: the monthly payment multiplied by the number of payments, plus any arrangement fee.",
  "guide.compare-loans.step.2":
    "Compare like terms. If one offer is over 20 years and another over 25, recalculate both over the same period before deciding.",
  "guide.compare-loans.step.3":
    "Check what the rate is fixed for. A low rate fixed for two years on a 25-year loan is a two-year price, not a 25-year one.",
  "guide.compare-loans.step.4":
    "Look at early repayment terms. A loan you can overpay freely is worth more than its rate suggests.",
  "guide.compare-loans.note.1":
    "Advertised APR helps because it folds in compulsory fees, but it still assumes you keep the loan for the full term. If you expect to repay early, model that instead.",
  "guide.compare-loans.faq.1.q": "Is a shorter term always better?",
  "guide.compare-loans.faq.1.a":
    "It always costs less in total, but it costs more each month. The right term is the shortest one whose payment you can sustain without relying on everything going well.",

  /* Practical: read schedule */
  "guide.read-schedule.title": "How to Read an Amortisation Schedule",
  "guide.read-schedule.desc": "What each column means and what to look for.",
  "guide.read-schedule.intro.1":
    "An amortisation schedule lists every payment over the life of a loan, split into the part that covers interest and the part that reduces the balance.",
  "guide.read-schedule.intro.2":
    "It is the most honest document about a loan, because it shows where the money actually goes rather than what the monthly figure looks like.",
  "guide.read-schedule.step.1":
    "Start with the interest column. Its total is the real price of borrowing; compare it to the amount borrowed.",
  "guide.read-schedule.step.2":
    "Find the crossover: the first row where the principal portion exceeds the interest portion. On a long loan it arrives later than expected.",
  "guide.read-schedule.step.3":
    "Check the balance column against the halfway point of the term. On a 25-year loan at typical rates, well over half the balance is still outstanding at year 12.",
  "guide.read-schedule.note.1":
    "A schedule assumes the rate never changes and every payment lands on time. It is a model of the loan, not a record of it.",
  "guide.read-schedule.faq.1.q": "Why does the last payment differ slightly?",
  "guide.read-schedule.faq.1.a":
    "Rounding. Each payment is rounded to the nearest minor unit, and the final one absorbs the accumulated difference so the balance lands exactly on zero.",

  /* Practical: plan savings */
  "guide.plan-savings.title": "How to Plan Monthly Savings",
  "guide.plan-savings.desc": "Turning a goal and a date into a monthly number.",
  "guide.plan-savings.intro.1":
    "Most savings plans fail because they start from what is left over rather than from the target. Working backwards from the goal gives a number you can actually check against.",
  "guide.plan-savings.intro.2":
    "The arithmetic is the future value formula rearranged: given the target, the time and the expected return, solve for the contribution.",
  "guide.plan-savings.step.1":
    "Write down the target and the date. A goal without a date has no monthly number attached to it.",
  "guide.plan-savings.step.2":
    "Subtract what you already have, grown at your expected rate. That is the shortfall the contributions have to cover.",
  "guide.plan-savings.step.3":
    "Divide the shortfall by the annuity factor for your rate and term - or let the planner do it, which is what it is for.",
  "guide.plan-savings.note.1":
    "For anything under about three years, assume no return at all. Markets are volatile over short periods, and a plan that needs a good year to work is not a plan.",
  "guide.plan-savings.faq.1.q": "Should I save or repay debt first?",
  "guide.plan-savings.faq.1.a":
    "Compare the rates. Debt costing more than your savings earn is worth clearing first - though keeping a small buffer prevents the next surprise turning into new debt.",

  /* Formula: future value */
  "guide.fv.title": "The Future Value Formula",
  "guide.fv.desc": "What regular contributions grow into, and why the formula has that shape.",
  "guide.fv.intro.1":
    "Every contribution you make compounds for a different length of time: the first one grows for the whole term, the last one for a single period. The future value formula adds all of those up in one step rather than month by month.",
  "guide.fv.var.fv": "The value of all contributions at the end.",
  "guide.fv.var.contribution": "The amount paid in each period.",
  "guide.fv.var.rate": "The rate per period - the annual rate divided by the number of periods.",
  "guide.fv.var.periods": "The total number of contributions.",
  "guide.fv.step.1": "Convert the annual rate to a per-period rate.",
  "guide.fv.step.2": "Count the contributions: years times contributions per year.",
  "guide.fv.step.3":
    "Apply the formula. The trailing (1 + i) is there because each contribution is made at the start of the period, so it earns one extra period of growth.",
  "guide.fv.example.intro": "500 a month for 20 years at 7% a year.",
  "guide.fv.example.contribution": "Monthly contribution (C)",
  "guide.fv.example.rate": "Monthly rate (i)",
  "guide.fv.example.periods": "Number of contributions (n)",
  "guide.fv.example.result": "Future value",
  "guide.fv.note.1":
    "Of that total, 120,000 is money paid in and the rest is growth. The split shifts heavily towards growth the longer the term runs, which is the whole argument for starting early.",
  "guide.fv.faq.1.q": "Why does my bank's figure differ slightly?",
  "guide.fv.faq.1.a":
    "Usually timing. This version assumes contributions at the start of each period; if yours are taken at the end, drop the trailing (1 + i) and the result falls by one period of growth.",
});

writeFileSync(PATH, `${JSON.stringify(dict, null, 2)}\n`, "utf8");
console.log(`en: ${Object.keys(dict).length} keys`);
