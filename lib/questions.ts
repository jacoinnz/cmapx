import { AnswerOption, Category, Question } from "./types";

// Business path answer scale: Yes = full credit, anything else is a gap.
export const businessAnswerScale: AnswerOption[] = [
  { value: "yes", label: "Yes", credit: 1 },
  { value: "no", label: "No", credit: 0 },
  { value: "unsure", label: "Not sure", credit: 0 },
];

// Owner-facing categories. `threat` is the plain consequence shown in the SWOT
// "Threats" quadrant when the category is a gap. No security jargon anywhere.
export const categories: Category[] = [
  {
    id: "access",
    ownerLabel: "Who can get in",
    description: "How well you control who can log in to your accounts and systems.",
    threat:
      "Someone who gets hold of a password could log straight into your email, bank or systems and lock you out.",
  },
  {
    id: "updates",
    ownerLabel: "Keeping things up to date",
    description: "Whether your devices and software are kept current.",
    threat:
      "Out-of-date software has known weaknesses that attackers actively scan for and walk through.",
  },
  {
    id: "backups",
    ownerLabel: "Your safety net",
    description: "Whether you could get your information back after a disaster.",
    threat:
      "A ransomware attack, theft or simple mistake could wipe your data with no way to get it back.",
  },
  {
    id: "detection",
    ownerLabel: "Spotting trouble",
    description: "Your ability to notice scams, viruses and suspicious activity.",
    threat:
      "A scam email or virus could go unnoticed until money or data is already gone.",
  },
  {
    id: "people",
    ownerLabel: "Your people",
    description: "How prepared your team is to avoid being tricked.",
    threat:
      "One staff member clicking a bad link or being fooled by a fake email can let an attacker in.",
  },
  {
    id: "response",
    ownerLabel: "If something goes wrong",
    description: "Whether you'd know what to do during an incident.",
    threat:
      "Without a plan, a small incident can turn into days of downtime, lost customers and extra cost.",
  },
];

export const questions: Question[] = [
  // ---- Who can get in (access) ----
  {
    id: "acc_mfa",
    categoryId: "access",
    kind: "maturity",
    weight: 2,
    text: "When you or your staff log in to important accounts (like email, banking or your main business systems), do you have to enter a second code — for example from a phone app or text — as well as a password?",
    helpText: "This 'two-step login' means a stolen password isn't enough on its own to get in.",
    recommendation: "Turn on two-step login (often called 2FA) for email, banking and key systems.",
  },
  {
    id: "acc_unique_pw",
    categoryId: "access",
    kind: "maturity",
    weight: 1,
    text: "Does everyone use a different password for each important account, rather than reusing the same one in several places?",
    helpText: "If you reuse a password and one website is breached, criminals try that same password everywhere else.",
    recommendation: "Use a different password for each account so one leak doesn't open the others.",
  },
  {
    id: "acc_pw_manager",
    categoryId: "access",
    kind: "maturity",
    weight: 1,
    text: "Do you use a password manager (an app that creates and remembers strong passwords for you)?",
    helpText: "A password manager lets you have a strong, unique password for every account without memorising them.",
    recommendation: "Set up a password manager so strong, unique passwords are easy to use.",
  },
  {
    id: "acc_leavers",
    categoryId: "access",
    kind: "maturity",
    weight: 1,
    text: "When someone leaves the business, do you reliably remove their access to all systems and accounts?",
    helpText: "Accounts that are never switched off are an easy, unnoticed way back in for a former staff member or an attacker.",
    recommendation: "Make a simple checklist to switch off accounts the day someone leaves.",
  },
  {
    id: "acc_admin",
    categoryId: "access",
    kind: "maturity",
    weight: 1,
    text: "Do only the people who genuinely need it have 'administrator' or full-control access to your systems?",
    helpText: "Fewer all-powerful accounts means far less damage if one of them is ever compromised.",
    recommendation: "Limit administrator access to the few people who truly need it.",
  },

  // ---- Keeping things up to date (updates) ----
  {
    id: "upd_auto",
    categoryId: "updates",
    kind: "maturity",
    weight: 2,
    text: "Are the computers and phones in your business set to install updates automatically?",
    helpText: "Updates fix security holes; installing them automatically means you're protected without having to remember.",
    recommendation: "Turn on automatic updates for computers and phones.",
  },
  {
    id: "upd_apps",
    categoryId: "updates",
    kind: "maturity",
    weight: 1,
    text: "Do you keep the programs and apps you use for work updated to their latest versions?",
    helpText: "Attackers target known weaknesses in out-of-date apps — updating closes those doors.",
    recommendation: "Update your business apps regularly, or set them to update themselves.",
  },
  {
    id: "upd_eol",
    categoryId: "updates",
    kind: "maturity",
    weight: 1,
    text: "Are you confident none of your devices run very old software that no longer gets security updates (for example very old Windows or phones)?",
    helpText: "Software past its 'end of life' never gets fixed, even when new holes are found in it.",
    recommendation: "Replace or upgrade devices running software that's no longer supported.",
  },
  {
    id: "upd_router",
    categoryId: "updates",
    kind: "maturity",
    weight: 1,
    text: "Does someone make sure your internet router, wifi and other network equipment are kept up to date?",
    helpText: "Your router is the front door to your whole network; an out-of-date one can be quietly taken over.",
    recommendation: "Keep your router/wifi up to date, or ask your provider to manage it.",
  },
  {
    id: "upd_website",
    categoryId: "updates",
    kind: "maturity",
    weight: 1,
    text: "If you have a website or online store, is the software behind it (and its plugins) kept updated?",
    helpText: "Most website hacks exploit old, unpatched plugins — keeping them current prevents the common attacks.",
    recommendation: "Keep your website platform and plugins updated, or have someone do it for you.",
  },

  // ---- Your safety net (backups) ----
  {
    id: "bak_exist",
    categoryId: "backups",
    kind: "maturity",
    weight: 2,
    text: "Do you keep backup copies of your important business information (files, customer records, accounts)?",
    helpText: "If your data is lost, stolen or locked by ransomware, a backup is often the only way to get it back.",
    recommendation: "Start taking regular backups of your important business information.",
  },
  {
    id: "bak_auto",
    categoryId: "backups",
    kind: "maturity",
    weight: 1,
    text: "Do those backups happen automatically, rather than relying on someone remembering?",
    helpText: "Manual backups get forgotten; automatic ones mean you always have a recent copy when you need it.",
    recommendation: "Set backups to run automatically on a schedule.",
  },
  {
    id: "bak_offsite",
    categoryId: "backups",
    kind: "maturity",
    weight: 1,
    text: "Is at least one backup kept somewhere separate from your main systems — for example in the cloud or off-site?",
    helpText: "If a fire, theft or ransomware hits your office, a separate copy is what survives.",
    recommendation: "Keep at least one backup off-site or in the cloud.",
  },
  {
    id: "bak_test",
    categoryId: "backups",
    kind: "maturity",
    weight: 1,
    text: "Have you ever actually tried restoring from a backup to check it works?",
    helpText: "A backup you've never tested may quietly be broken — and you'd only find out when you need it most.",
    recommendation: "Do a test restore so you know your backups actually work.",
  },
  {
    id: "bak_secure",
    categoryId: "backups",
    kind: "maturity",
    weight: 1,
    text: "Are your backups protected so an attacker who gets into your systems can't simply delete or scramble them too?",
    helpText: "Modern ransomware deliberately hunts for and destroys backups, so they need to be out of its reach.",
    recommendation: "Protect backups so they can't be deleted or changed by an attacker.",
  },

  // ---- Spotting trouble (detection) ----
  {
    id: "det_av",
    categoryId: "detection",
    kind: "maturity",
    weight: 1,
    text: "Do your computers have up-to-date security software (antivirus / anti-malware) running?",
    helpText: "Security software catches and blocks most common viruses and malware before they can do harm.",
    recommendation: "Make sure every computer runs up-to-date security software.",
  },
  {
    id: "det_spam",
    categoryId: "detection",
    kind: "maturity",
    weight: 1,
    text: "Does your email automatically filter out most spam and suspicious messages before they reach you?",
    helpText: "Most attacks arrive by email; good filtering stops the majority of scams before you ever see them.",
    recommendation: "Turn on spam and scam filtering in your email — most providers include it.",
  },
  {
    id: "det_phish_know",
    categoryId: "detection",
    kind: "maturity",
    weight: 2,
    text: "Would you and your staff usually recognise a fake email trying to trick you into clicking a link or paying a false invoice?",
    helpText: "Phishing emails are the most common way businesses get hacked — recognising them is your best defence.",
    recommendation: "Learn the common signs of scam emails and fake invoices.",
  },
  {
    id: "det_alerts",
    categoryId: "detection",
    kind: "maturity",
    weight: 1,
    text: "Do you get an alert if someone logs into your important accounts from a new device or unusual place?",
    helpText: "An unexpected login alert is often your first and only warning that someone else has your password.",
    recommendation: "Turn on login and security alerts for email and key accounts.",
  },
  {
    id: "det_payment_check",
    categoryId: "detection",
    kind: "maturity",
    weight: 1,
    text: "Before paying an invoice or changing a supplier's bank details, do you check the request is genuine (for example by phoning a known number)?",
    helpText: "'Invoice scams' trick businesses into paying money straight to criminals by faking a supplier's email.",
    recommendation: "Always verify payment or bank-change requests using a known phone number.",
  },

  // ---- Your people (people) ----
  {
    id: "ppl_aware",
    categoryId: "people",
    kind: "maturity",
    weight: 1,
    text: "Have you and your staff had any basic guidance on staying safe online at work (spotting scams, using strong passwords)?",
    helpText: "Most incidents start with a person being tricked; a little awareness prevents a lot of them.",
    recommendation: "Give staff a short, plain refresher on online safety.",
  },
  {
    id: "ppl_report",
    categoryId: "people",
    kind: "maturity",
    weight: 2,
    text: "Do staff know who to tell if they think they've clicked something bad or made a mistake — without fear of getting in trouble?",
    helpText: "People hide mistakes when they're scared, and a hidden mistake gives an attacker more time to do damage.",
    recommendation: "Make it clear and safe for staff to report mistakes quickly.",
  },
  {
    id: "ppl_personal",
    categoryId: "people",
    kind: "maturity",
    weight: 1,
    text: "Do you have a basic handle on which work is done on personal phones or home computers, and whether that's safe?",
    helpText: "Work done on unprotected personal devices can leak business data without you ever knowing.",
    recommendation: "Agree simple rules for using personal devices for work.",
  },
  {
    id: "ppl_wifi",
    categoryId: "people",
    kind: "maturity",
    weight: 1,
    text: "Are staff careful about doing sensitive work on public wifi (cafés, airports) without protection?",
    helpText: "On open public wifi, others can sometimes intercept what you send unless it's protected.",
    recommendation: "Avoid sensitive work on public wifi, or use a trusted VPN.",
  },
  {
    id: "ppl_social",
    categoryId: "people",
    kind: "maturity",
    weight: 1,
    text: "Are you aware that criminals can use details from social media or phone calls to impersonate you or your staff?",
    helpText: "Criminals piece together public details to convincingly impersonate you and trick staff or suppliers.",
    recommendation: "Be cautious about sharing details that could help someone impersonate your business.",
  },

  // ---- If something goes wrong (response) ----
  {
    id: "res_who",
    categoryId: "response",
    kind: "maturity",
    weight: 2,
    text: "If your systems were hacked tomorrow, would you know who to call first for help?",
    helpText: "In the first hour of an attack, knowing exactly who to call saves time, money and data.",
    recommendation: "Write down who to call (IT support, bank, insurer) if something goes wrong.",
  },
  {
    id: "res_plan",
    categoryId: "response",
    kind: "maturity",
    weight: 1,
    text: "Do you have a simple written plan for what to do if you're hit by a cyber attack or lose access to your systems?",
    helpText: "A simple plan written in advance stops panic and costly mistakes during a real incident.",
    recommendation: "Write a one-page plan for handling a cyber incident.",
  },
  {
    id: "res_contacts",
    categoryId: "response",
    kind: "maturity",
    weight: 1,
    text: "Do you have an up-to-date list of key contacts (IT help, bank, important suppliers) you could reach quickly?",
    helpText: "If your systems are down, you may not be able to look up the very contacts you suddenly need.",
    recommendation: "Keep an up-to-date emergency contact list, including an offline copy.",
  },
  {
    id: "res_report_gov",
    categoryId: "response",
    kind: "maturity",
    weight: 1,
    text: "Would you know that you can report a cyber attack or scam in New Zealand (for example to CERT NZ) and where to get help?",
    helpText: "CERT NZ offers free help and guidance for NZ businesses — knowing it exists means you're not alone in a crisis.",
    recommendation: "Note how to report an incident to CERT NZ for free help.",
  },
  {
    id: "res_downtime",
    categoryId: "response",
    kind: "maturity",
    weight: 1,
    text: "If your main systems were down for a day or two, do you have a way to keep serving customers or keep records?",
    helpText: "A way to keep operating means a cyber incident doesn't have to stop your business or income.",
    recommendation: "Think through how you'd keep operating if systems went down.",
  },

  // ---- Exposure questions (drive the insurance recommendation, not maturity) ----
  {
    id: "exp_personal_data",
    categoryId: "response",
    kind: "exposure",
    weight: 3,
    text: "Does your business hold personal information about customers or staff — like names, contact details, payment details or health information?",
    helpText: "Holding personal information brings legal duties under the Privacy Act 2020 if that information is ever breached.",
    exposureReason:
      "You hold personal information, so under the Privacy Act 2020 you may be legally required to report a breach to the Privacy Commissioner and the people affected.",
  },
  {
    id: "exp_online_income",
    categoryId: "response",
    kind: "exposure",
    weight: 2,
    text: "Would your business lose income or struggle to operate if your systems, website or online tools were down for a day?",
    helpText: "The more your income depends on systems being up, the more a single outage or attack costs you.",
    exposureReason:
      "You depend on online systems for income, so downtime or an attack would directly cost you money.",
  },
  {
    id: "exp_absorb_cost",
    categoryId: "response",
    kind: "exposure",
    weight: 2,
    text: "Would an unexpected bill of $50,000 or more — for recovery, legal help and notifying customers — be hard for your business to absorb?",
    helpText: "Cyber incidents often cost far more than expected once recovery, legal and notification costs add up.",
    exposureReason:
      "A serious incident can cost tens of thousands of dollars, which would be hard to absorb out of pocket.",
  },
  {
    id: "exp_regulated",
    categoryId: "response",
    kind: "exposure",
    weight: 1,
    text: "Does your business work in a regulated or sensitive area (such as health, finance, or supplying government), or have contracts that require you to protect data?",
    helpText: "Regulated and contracted work usually carries extra security obligations — and bigger consequences if breached.",
    exposureReason:
      "You operate in a regulated or contractually-bound area, which raises both your obligations and your risk.",
  },
  {
    id: "exp_payments",
    categoryId: "response",
    kind: "exposure",
    weight: 1,
    text: "Do you handle online payments or store customer card / payment details?",
    helpText: "Payment data is exactly what criminals want, so handling it raises both your risk and your responsibilities.",
    exposureReason:
      "You handle payment information, which is a prime target for criminals and carries extra obligations.",
  },
];
