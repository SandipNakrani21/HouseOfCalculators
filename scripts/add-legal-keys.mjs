/**
 * English copy for the legal pages.
 *
 * Written against what the site actually does rather than from a template:
 * two preference cookies, no accounts, no forms, and calculation that never
 * leaves the browser. Anything the operator has to supply is a placeholder
 * (`{entity}`, `{email}`, `{jurisdiction}`) filled from OPERATOR, and the
 * pages show a notice for as long as those are unset.
 */
import { readFileSync, writeFileSync } from "node:fs";

const PATH = "src/lib/i18n/dictionaries/en.json";
const dict = JSON.parse(readFileSync(PATH, "utf8"));

Object.assign(dict, {
  // Shared chrome.
  "legal.updated": "Last updated {date}",
  "legal.unconfigured.title": "This page is not ready to publish",
  "legal.unconfigured.body":
    "The operator details below have not been filled in yet, so this page still contains placeholders. Set them in src/config/legal/definitions.ts before the site goes live.",
  "legal.unconfigured.entity": "Legal entity or individual publishing the site",
  "legal.unconfigured.email": "Contact address for privacy requests",
  "legal.unconfigured.jurisdiction": "Country or state whose law governs the terms",
  "legal.seeAlso": "Related pages",

  "legal.link.googleAds": "How Google uses cookies in advertising",
  "legal.link.googlePrivacy": "Google Privacy Policy",
  "legal.link.adsSettings": "Google Ads Settings",
  "legal.link.allAboutCookies": "AllAboutCookies.org — managing cookies",

  // ---------------------------------------------------------------- privacy
  "legal.privacy.title": "Privacy Policy",
  "legal.privacy.desc":
    "What {app} stores, what it does not collect, and how advertising affects your privacy.",
  "legal.privacy.intro":
    "This policy describes how {app} handles information when you use the site. It is written to be read, not to be skimmed past, and it describes what the site actually does rather than everything a site of this kind might conceivably do.",

  "legal.privacy.summary.title": "The short version",
  "legal.privacy.summary.1":
    "If you read nothing else on this page, these four points are the substance of it.",
  "legal.privacy.summary.b1":
    "The numbers you type into a calculator never leave your device. Every calculation on this site runs in your browser.",
  "legal.privacy.summary.b2":
    "There are no accounts, no sign-up and no contact form, so there is nothing for us to store about you.",
  "legal.privacy.summary.b3":
    "Two cookies remember your language and your country. That is the only thing the site itself stores on your device.",
  "legal.privacy.summary.b4":
    "Advertising is served by Google, which sets its own cookies and is governed by Google's policies, not ours.",

  "legal.privacy.stored.title": "What this site stores on your device",
  "legal.privacy.stored.1":
    "The site sets two first-party cookies. Both hold a preference you chose, both last one year, and neither contains anything that identifies you.",
  "legal.privacy.stored.2":
    "They exist so the site does not ask you the same two questions on every visit. If you block them the site still works — it simply reads your choices from the address bar each time instead.",
  "legal.privacy.stored.b1":
    "{localeCookie} — the language and market you chose, so pages open in the right language.",
  "legal.privacy.stored.b2":
    "{countryCookie} — the country you chose, which sets the currency, number formatting and statutory rules the calculators use.",

  "legal.privacy.notCollected.title": "What is not collected",
  "legal.privacy.notCollected.1":
    "Because the site has no accounts and no forms, the following simply do not exist here.",
  "legal.privacy.notCollected.b1":
    "No name, email address, phone number or postal address.",
  "legal.privacy.notCollected.b2":
    "No salary, loan amount, tax figure or any other number you enter into a calculator. These are computed in your browser and are never transmitted anywhere.",
  "legal.privacy.notCollected.b3":
    "No account, profile or history of what you calculated.",
  "legal.privacy.notCollected.b4":
    "No data sold, rented or shared with data brokers, under any circumstances.",

  "legal.privacy.ads.title": "Advertising",
  "legal.privacy.ads.1":
    "{app} is supported by advertising so that it can stay free to use. When an advert appears on a page, it is served by Google AdSense.",
  "legal.privacy.ads.2":
    "Google and its partners may use cookies and similar technologies to serve and measure those adverts, including adverts based on your prior visits to this or other sites. This processing is carried out by Google under its own policies; we do not receive the data behind it and cannot identify you from it.",
  "legal.privacy.ads.3":
    "You can opt out of personalised advertising in Google Ads Settings, and you can block advertising cookies in your browser. Either choice leaves the calculators working exactly as they do now.",

  "legal.privacy.hosting.title": "Hosting and server logs",
  "legal.privacy.hosting.1":
    "Pages are served by a hosting provider which, like any web server, processes the technical details of a request — IP address, browser user agent, the page requested and the time — in order to deliver the page and to protect the service from abuse.",
  "legal.privacy.hosting.2":
    "This is standard infrastructure logging. It is not used to build a profile of you, and it is not combined with anything else on this site.",

  "legal.privacy.rights.title": "Your rights",
  "legal.privacy.rights.1":
    "Data protection law, including the GDPR in the EU and UK, gives you rights over personal data held about you — access, correction, erasure, restriction and objection among them.",
  "legal.privacy.rights.2":
    "In practice this site holds nothing to exercise them against, because it stores nothing about you. Two things are still worth knowing.",
  "legal.privacy.rights.b1":
    "The cookies described above are on your device, under your control. Clearing your browser's site data removes them immediately and completely.",
  "legal.privacy.rights.b2":
    "For anything Google holds about your advertising profile, the request goes to Google rather than to us; its privacy policy explains how.",
  "legal.privacy.rights.b3":
    "If you believe something on this site has handled your data wrongly, write to {email} and it will be looked into.",

  "legal.privacy.children.title": "Children",
  "legal.privacy.children.1":
    "This site is a general-purpose reference tool and is not directed at children. It does not knowingly collect information from anyone, including children, because it does not collect information from visitors at all.",

  "legal.privacy.changes.title": "Changes to this policy",
  "legal.privacy.changes.1":
    "If the site starts doing something this page does not describe — adding analytics, for example — this page is updated before that change ships, and the date at the top changes with it. A policy that quietly becomes untrue is worse than no policy.",

  "legal.privacy.contact.title": "Contact",
  "legal.privacy.contact.1":
    "Questions about this policy can go to {email}. The site is published by {entity}.",

  // ---------------------------------------------------------------- cookies
  "legal.cookies.title": "Cookies",
  "legal.cookies.desc":
    "Every cookie {app} sets, why it exists, and how to turn it off.",
  "legal.cookies.intro":
    "A cookie is a small piece of text a site asks your browser to keep. This page lists every cookie involved in using {app} — there are not many.",

  "legal.cookies.own.title": "Cookies this site sets",
  "legal.cookies.own.1":
    "Two, both first-party, both storing a choice you made. They last one year, are marked SameSite=Lax, and contain no identifier of any kind.",
  "legal.cookies.own.2":
    "These are strictly functional: without them the site would ask you to choose a language and a country on every single visit.",
  "legal.cookies.own.b1":
    "{localeCookie} — your chosen language and market. Value: a locale code such as en-US.",
  "legal.cookies.own.b2":
    "{countryCookie} — your chosen country. Value: a two-letter country code such as gb.",

  "legal.cookies.third.title": "Advertising cookies",
  "legal.cookies.third.1":
    "When advertising is shown, Google AdSense and its partners may set their own cookies to serve adverts, limit how often you see the same one, and measure whether it worked.",
  "legal.cookies.third.2":
    "These cookies are set by Google rather than by this site, and we can neither read them nor control what they contain. Google's own pages describe them and let you change your settings.",

  "legal.cookies.noTracking.title": "What is not used",
  "legal.cookies.noTracking.1":
    "There are no analytics cookies, no social-media pixels, no session recording and no cross-site tracking added by this site. Nothing is stored in local storage. If that changes, this page changes first.",

  "legal.cookies.control.title": "Turning cookies off",
  "legal.cookies.control.1":
    "Every browser can block or delete cookies, per site or entirely, in its privacy settings. Blocking the two preference cookies costs you nothing but the convenience of being asked once instead of every visit — the calculators are unaffected, because they never depended on a cookie to work.",
  "legal.cookies.control.2":
    "To stop seeing personalised adverts specifically, use Google Ads Settings rather than blocking cookies wholesale.",

  "legal.cookies.changes.title": "Changes",
  "legal.cookies.changes.1":
    "This page is updated whenever a cookie is added or removed, and the date at the top changes with it.",

  // ------------------------------------------------------------------ terms
  "legal.terms.title": "Terms of Use",
  "legal.terms.desc":
    "The terms on which {app} is provided, including what its results are and are not.",
  "legal.terms.intro":
    "These terms govern your use of {app}. They are deliberately short, and the section that matters most is the one about what the results are for.",

  "legal.terms.accept.title": "Accepting these terms",
  "legal.terms.accept.1":
    "By using this site you accept these terms. If you do not accept them, please do not use the site. The site is published by {entity}.",

  "legal.terms.notAdvice.title": "This is a calculator, not an adviser",
  "legal.terms.notAdvice.1":
    "Everything on {app} is provided for general information and illustration. It is not financial, tax, legal, medical or professional advice of any kind, and using it does not create a professional relationship of any kind.",
  "legal.terms.notAdvice.2":
    "The calculators model general rules. They cannot know your circumstances, and real outcomes depend on details a general model has no way to capture — your full income picture, reliefs you qualify for, a lender's own criteria, the terms of a specific contract.",
  "legal.terms.notAdvice.3":
    "Before you act on a number from this site — signing a loan, filing a return, making an investment — have it checked by a qualified professional who knows your situation.",

  "legal.terms.accuracy.title": "Accuracy",
  "legal.terms.accuracy.1":
    "The formulas are implemented carefully and are covered by automated tests, and the reference tables are generated from the same code as the tools beside them, so the two cannot disagree.",
  "legal.terms.accuracy.2":
    "Statutory figures are a different matter. Tax bands, thresholds, contribution rates and duty schedules change, sometimes mid-year and sometimes retroactively. Each country tool states the year its rules were written for, and where a country's model leaves something out, the page says so rather than hiding it.",
  "legal.terms.accuracy.3":
    "No warranty is given that any figure is current, complete or correct for your situation. Verify statutory figures against the official source before relying on them.",

  "legal.terms.use.title": "Acceptable use",
  "legal.terms.use.1":
    "You may use the site freely for personal and professional purposes, including using its results in your own work. You may not:",
  "legal.terms.use.b1":
    "attempt to disrupt the site, or access it in a way designed to degrade it for others;",
  "legal.terms.use.b2":
    "scrape the site at a volume that burdens it, or republish it wholesale as your own;",
  "legal.terms.use.b3":
    "present its results to others as professional advice, or as figures that have been verified for their circumstances.",

  "legal.terms.ip.title": "Content and intellectual property",
  "legal.terms.ip.1":
    "The design, text, code and structure of this site belong to {entity}, except where stated otherwise. Trade marks and product names mentioned belong to their respective owners.",
  "legal.terms.ip.2":
    "Results a calculator produces from figures you entered are yours. Use them however you like; nothing here claims ownership of your numbers.",

  "legal.terms.links.title": "Links to other sites",
  "legal.terms.links.1":
    "Where this site links to an official source or another site, it does so because the link is useful. Those sites are not under our control, and linking to one is not an endorsement of it.",

  "legal.terms.availability.title": "Availability",
  "legal.terms.availability.1":
    "The site is provided as it is, without any promise that it will be available without interruption or free of errors. Pages, tools and countries may be added, changed or withdrawn at any time.",

  "legal.terms.liability.title": "Limitation of liability",
  "legal.terms.liability.1":
    "To the fullest extent the law allows, {entity} is not liable for any loss arising from use of this site or reliance on anything it produces — including financial loss, loss of profits, or loss arising from a decision made on the basis of a figure shown here.",
  "legal.terms.liability.2":
    "Nothing in these terms limits liability for death or personal injury caused by negligence, for fraud, or for anything else that cannot lawfully be limited.",

  "legal.terms.law.title": "Governing law",
  "legal.terms.law.1":
    "These terms are governed by the law of {jurisdiction}, and disputes relating to them fall to the courts of {jurisdiction}. This does not remove any protection given to you by the mandatory law of the country you live in.",

  "legal.terms.changes.title": "Changes to these terms",
  "legal.terms.changes.1":
    "These terms may be updated. The date at the top of the page shows when they last were; continuing to use the site after a change means accepting the revised terms.",

  // ---------------------------------------------------------------- contact
  "legal.contact.title": "Contact",
  "legal.contact.desc": "How to reach {app}, and what to expect when you do.",
  "legal.contact.intro":
    "There is no contact form on this site, on purpose: a form would mean collecting and storing your details, and the privacy policy would have to grow a section to cover it. Email is simpler and leaves you in control of what you send.",

  "legal.contact.reach.title": "How to reach us",
  "legal.contact.reach.1": "Write to {email}. The site is published by {entity}.",
  "legal.contact.reach.2":
    "Corrections, questions about how a calculation works, requests for a calculator or a country, and press or partnership enquiries are all welcome at that address.",

  "legal.contact.errors.title": "Reporting an error in a calculation",
  "legal.contact.errors.1":
    "These are the most useful messages we get, and they are always acted on. To make one quick to reproduce, include:",
  "legal.contact.errors.b1":
    "the page address, and the country and language you were using;",
  "legal.contact.errors.b2":
    "the figures you entered and the result you were shown;",
  "legal.contact.errors.b3":
    "the result you expected, and the source it comes from if there is one.",

  "legal.contact.cannot.title": "What we cannot do",
  "legal.contact.cannot.1":
    "We cannot advise on your personal finances, tax position or legal situation, and cannot check a calculation against your circumstances. That is what a qualified professional is for, and answering it by email would be doing it badly.",

  "legal.contact.privacy.title": "Privacy requests",
  "legal.contact.privacy.1":
    "Data protection questions go to the same address. Note that the site stores nothing about you, so most such requests have a very short answer — the privacy policy explains why.",

  // ------------------------------------------------------------------ about
  "legal.about.title": "About",
  "legal.about.desc":
    "What {app} is, how it is built, and how its numbers are checked.",
  "legal.about.intro":
    "{app} is a reference site for calculations: the arithmetic people look up, in the language they read and for the country whose rules apply to them.",

  "legal.about.what.title": "What this is",
  "legal.about.what.1":
    "Calculators, converters, everyday tools, reference tables and guides, organised so that a calculation has one home rather than a dozen near-identical pages competing for it.",
  "legal.about.what.2":
    "The design goal is narrow: answer the question on the page you landed on, show the working, and let you change the assumptions and watch the answer move.",

  "legal.about.built.title": "How it is built",
  "legal.about.built.1":
    "Every calculation runs in your browser. Nothing is sent to a server to be computed, which is what makes the results instant when you drag a slider, and what makes the privacy policy as short as it is.",
  "legal.about.built.2":
    "The formulas are covered by an automated test suite that runs on every change, checking known values, edge cases such as zero-interest loans, and internal consistency — that a repayment schedule adds back up to the loan, for instance.",

  "legal.about.numbers.title": "Where the numbers come from",
  "legal.about.numbers.1":
    "Mathematical and unit conversions use defined constants — an inch is exactly 2.54 centimetres — so they are correct by definition rather than by approximation. Reference tables are generated from the same code as the tool beside them, so a table can never drift from the calculator it belongs to.",
  "legal.about.numbers.2":
    "Statutory figures are different, and we would rather say so than imply a precision we do not have. Each country tool records the year its rules were written for, and states plainly where its model is simplified — a country whose regional taxes are not included says exactly that on the page.",

  "legal.about.languages.title": "Languages and countries",
  "legal.about.languages.1":
    "The language you read in and the country you calculate for are separate choices, because they genuinely are separate: someone may read English comfortably while needing German tax rules.",
  "legal.about.languages.2":
    "A language is only offered once its translation actually covers the site. Offering a language and then showing English pages would be a worse experience than not offering it, so languages appear as they are finished rather than as they are started.",

  "legal.about.funding.title": "How it is funded",
  "legal.about.funding.1":
    "Advertising, so the site can stay free and need no account. Adverts are placed where they do not interrupt a calculation, are labelled, and reserve their space in advance so the page never jumps as one loads.",
  "legal.about.funding.2":
    "Nothing on this site is a paid placement dressed up as a result, and no calculator is tuned to steer you towards an advertiser.",

  "legal.about.not.title": "What this is not",
  "legal.about.not.1":
    "It is not an adviser, a broker, or a substitute for professional judgement about your own situation. It is a well-built calculator that shows its working — useful before a conversation with a professional, not instead of one.",
});

writeFileSync(PATH, `${JSON.stringify(dict, null, 2)}\n`, "utf8");
console.log(`en.json now defines ${Object.keys(dict).length} keys.`);
