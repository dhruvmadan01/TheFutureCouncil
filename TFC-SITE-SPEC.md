# The Future Council website: full restructure spec

This is the complete brief for rebuilding thefuturecouncil.in. It covers the story, the visual world, every page, the money terms, and the old-to-new URL map.
`tfc-story-home.html` is the finished homepage design. Every other page must look and feel like it belongs to that same world.

---

## 1. What TFC is (for context)

The Future Council (TFC) is a student startup ecosystem in India with three initiatives:
- **Chapters**: free, student-run communities on 90+ campuses. Build nights, co-founder matching, demo days.
- **Startup School**: a practical course on starting a company as a student. ₹399/month subscription. Chapter members get 7 days free.
- **Launchpad**: a selective 4-week online fellowship for 20 founders per cohort, ending in Demo Day with investors. Fellowship '26 is Cohort 01.

**Vision:** A generation where building something is the default way to spend college, not the risky exception.
**Mission:** Give every student in India, from any college, the community, the skills and the capital access to build a startup while they study.
**Core belief:** Students shouldn't spend college waiting in the placement queue. What you build is your proof.
**Tagline:** "Don't queue. Build." Footer line: "Where student builders stop waiting for permission."
**Founders:** Dhruv Madan and Aryaveer Chauhan.

---

## 2. The story and the world

The whole site is one story: **a student stepping out of the placement queue and walking into a world of builders.**

There are two visual worlds. Use them consistently across every page:

| | The Line (the old path) | The Builder World (TFC) |
|---|---|---|
| Meaning | Placement prep, waiting, being picked by others | Building, community, momentum |
| Background | Cold office grey-green `#D6DCD3`, darker `#C6CDC2` | Warm `#FFF4E8`, soft `#FBE6D4` |
| Text | `#1E2124`, muted `#4E555A` | `#1B1712`, muted `#5A4E44` |
| Details | Ballpoint blue `#2C4A9A`, paper slips `#F7F6EF`, token numbers, rubber stamps, notice-board pins, "Now serving" counters | TFC orange `#E2542A` (hover `#AE3D18`), dashed orange paths, pins, tickets, receipts, glowing campus dots |
| Where used | Only where a page names the problem (usually one section, near the top) | Everything else |

Also used: night ink `#1B1712` for "campus at night" sections (dots glowing orange), and forest green `#1F5A45` for safety nets and positive outcomes.

**Characters:** simple rounded human figures (circle head, rounded body). Grey figures = people in the queue. One orange figure = the builder. Reuse the canvas drawing code from `tfc-story-home.html`.

**Type (Google Fonts):**
- Display: **Bricolage Grotesque** 800, tight letter-spacing (−0.02em), balanced wrapping
- Body: **Instrument Sans** 400/500/600
- Labels, numbers, tokens, stamps: **IBM Plex Mono**, uppercase with letter-spacing for labels

**Recurring objects** (reuse these as components):
- Token slip ("Your token No. 4,218"), "Now serving" counter
- Pinned notice card with a stamp, used for sourced statistics
- The path: numbered stops joined by a dashed orange line (Chapters → Startup School → Launchpad)
- Campus sky: chapter names as glowing pills on a dark background, with a search box
- Receipt ("What you leave with, even if it fails")
- Orange ticket with a white stub (the Launchpad deal and countdown)
- Founders' letter (large quote, photos, signature)
- Sticky bottom bar with the Launchpad deadline and an Apply button (only while applications are open)

**Voice:** a senior talking to a junior. Direct, warm, specific, short sentences. Indian context (placements, CGPA, semester, ₹). Never write "revolutionize", "democratizing", "venture-ready", or superlatives like "India's largest". Never claim "companies prefer founders" or "we get your startup funded". Say "we work to get you in front of the right investors".

**Rules:** no emoji icons; mobile first (390px, no sideways scroll); respect reduced motion; every statistic links to its source with a year; never invent testimonials, numbers, investors or logos. Use a clearly marked placeholder instead.

---

## 3. Launchpad terms: the single source of truth

Every page, FAQ, form, email and legal page must match this table exactly.

| Term | Value |
|---|---|
| Seats | 20 founders per cohort, selected |
| Application fee | ₹999, one time, paid at application, non-refundable. |
| Fee waiver | Always available; the "Request a fee waiver" link sits next to every price |
| Selection basis | The problem, progress and team. Never the college. |
| If not selected | Written feedback (what's strong + 2–3 things to fix), 1 month of Startup School free (worth ₹399), 50% off the next application (₹499) |
| Equity | 0%, ever |
| Success fee | 5%, one time, cash, only on money raised from investors TFC introduced, within 12 months of Demo Day |
| Raised alone, or didn't raise | Owe nothing |
| Format | 4 weeks, fully online, pods of 4–5, weekly live lab, mentor office hours, Demo Day |
| Cohort 01 dates | Applications close Sep 30, 2026, 7 PM IST. Kickoff Oct 19, 2026. |
| Startup School | ₹399/month, cancel anytime. Chapter members get 7 days free. |

Remove everywhere: "open admission", "no shortlist", "no cap", "₹999" as the fee, "₹35 a day", "pay only if accepted", "no payment now", "Branches".

---

## 4. Site map and navigation

**Top nav:** The Future Council (logo) · Chapters · Startup School · Launchpad · Why Build · Stories · [Join free] button
**Footer:** About · Partners · Hire builders · Ambassadors · Library · Terms · Privacy · Refunds · Instagram · LinkedIn · support@thefuturecouncil.in, plus the footer line.

| Page | New URL | Old URLs that must redirect here (301) |
|---|---|---|
| Home | `/` | `/index.html` |
| Why Build | `/why` | (new) |
| Chapters | `/chapters` | `/branches.html` |
| Each chapter | `/chapters/<college>` | `/branch-<college>.html` |
| Start a chapter | `/chapters/start` | `/join-ambassador.html` (keep `/ambassador.html` login working) |
| Startup School | `/school` | (new) |
| Library | `/school/library` | `/resources.html` |
| Launchpad | `/launchpad` | (new) |
| Fellowship '26 | `/launchpad/fellowship` | `/fellowship.html`, `/fellowship` |
| Stories | `/stories` | (new) |
| About | `/about` | (new) |
| Partners | `/about/partners` | `/partners.html` |
| Join | `/join` | `/join.html` |

Old URLs must never 404. Every page ends with a call to action for the next step on the path: Chapters → Startup School → Launchpad.

---

## 5. Pages

### 5.1 Home `/`
Use `tfc-story-home.html` as is. Connect its buttons to the real pages above. Keep the existing SEO tags, favicon, social image and analytics from the old homepage.

### 5.2 Why Build `/why`: "The notice board"
Opens in **the Line** world, then turns warm.
1. **Opening scene (Line world):** a notice board full of pinned slips. Headline: "Read the notices. Then decide." Pinned stats (each with a source link):
   - 59% of registered students at IIT Gandhinagar unplaced, 2023-24, RTI ([Careers360](https://news.careers360.com/iit-gandhinagar-placements-average-median-salary-package-40-pc-not-placed-jobs-2024))
   - 30–40% of registered students at several IITs without offers by late April 2024 (same source)
   - Campus placement rates fell 5–16% at IIT Kanpur, Kharagpur and Roorkee, 2018-19 to 2023-24 ([The Wire / Indian Express RTI](https://m.thewire.in/article/education/campus-placements-drop-at-most-first-gen-iits-except-iit-delhi-report))
   - 54.8% of Indian graduates assessed employable ([India Skills Report 2025](https://taggd.in/industry-reports/isr/india-skills-report-2025/))
   - 19% gap in hiring of 22–25-year-olds in AI-exposed jobs, US data ([Stanford, Aug 2026](https://digitaleconomy.stanford.edu/news/canariesaug26/))
2. **The manifesto (warm world)**, in large display type, revealed paragraph by paragraph on scroll:
   > We were told the plan was simple. Crack the exam, get the seat, clear the placement season, and life is set.
   > The plan is breaking. Seats are harder to fill with offers. Machines are learning the work that entry-level jobs were made of. And a degree on its own proves less every year.
   > We think there's a better way to spend four years. **Build something.** Find a problem you can't stop thinking about, find the people who care about it too, and ship.
   > You might fail. Most startups do. You'll still leave college having done what no mock interview can teach: made something real, for real people, with real stakes.
   > This shouldn't be a privilege of a few campuses with an incubator and an alumni network. It should be normal, in every college, in every city.
   > That's why The Future Council exists. **Don't queue. Build.**
3. **What a startup teaches that placement prep doesn't:** customers, selling, shipping, hiring, failing well. A two-column "Placement prep vs Building" comparison.
4. **The safety nets** `#safety-nets` (forest green): Deferred placement at IIT Bombay, IIT Delhi, IIT Kanpur, IIT Guwahati, IIIT Bangalore and several IIMs (up to 2 years). The National Innovation & Startup Policy 2019 asks colleges to allow semester/year breaks, academic credit and attendance relaxation for student founders ([NISP](https://nisp.mic.gov.in/assets/html/AboutNationalInnovationAndStartu.html)). "Ask your college for these."
5. **A note for parents** `#parents`: calm, one screen, simple language. What TFC is, no equity taken, the safety nets, the experience counts even if the startup fails. A "Share with your parents on WhatsApp" button (`https://wa.me/?text=` + message + link to `/why#parents`).
6. CTA: "Find your chapter →"

### 5.3 Chapters `/chapters`: "The campus at night"
Dark night-ink world with glowing orange dots.
1. **Hero:** "Every startup starts with the people next to you." Sub: "Student-run chapters on 90+ campuses. Build nights, co-founder matching and demo days on your own campus. Free to join." Background: a night sky of glowing campus dots that light up one by one.
2. **What a chapter does:** four cards (Monthly build night · Co-founder matching · Semester demo day · Startup School study group) and the perk: "Every member gets 7 days of Startup School free."
3. **Directory:** search by college or city, filter by state. Card per chapter: college, city, chapter lead (name + photo), status (Active / Forming), last event. Store all chapters in one data file (JSON). Move existing branch pages' data into it. Leave unknown fields empty; never invent.
4. **Chapter page** `/chapters/<college>`, one template for all: lead, upcoming events, local builders, [Join this chapter].
5. **"No chapter at your college? Start one."** The ambassador programme, renamed **Chapter Lead**: what you do, what you get, apply. Keep the existing ambassador login working.
6. CTA: "Ready to learn how to actually build? → Startup School"

### 5.4 Startup School `/school`: "The workshop"
Warm world, workbench feel: modules as tool cards, each ending in a deliverable.
1. **Hero:** "The course college doesn't offer." Sub: "A practical curriculum on starting a company as a student, from finding a problem to raising your first cheque."
2. **Price block:** "₹399 a month. Cancel anytime." Buttons: [Subscribe] · [Chapter member? Start 7 days free]. Line under it: "Not a member yet? Join a chapter free and unlock 7 days." → `/chapters`
3. **Who it's for:** No idea yet · Have an idea · Already building
4. **Curriculum:**

| # | Module | You leave with |
|---|---|---|
| 1 | Finding a problem worth solving | Problem statement |
| 2 | Talking to users | 20 interview notes |
| 3 | Building an MVP with AI tools | Live prototype |
| 4 | Your first 10 customers | Traction log |
| 5 | Co-founders, equity & teams | Founder agreement |
| 6 | Money: pricing, unit economics, grants | Simple model |
| 7 | Company basics in India: incorporation, DPIIT, compliance | Checklist |
| 8 | Startups & your college: deferred placement, NISP, credits | Your college's options |
| 9 | Pitching & fundraising | Deck + 2-minute pitch |

5. **Format:** self-paced lessons + weekly live sessions (timings: placeholder). **Teachers:** operators and founders (placeholder photos).
6. **Outcome:** a public Proof of Work profile. Graduates get priority review at Launchpad.
7. **Library** `/school/library`: the old Resources content, grouped by module.
8. CTA: "Built something? → Apply to Launchpad"

### 5.5 Launchpad `/launchpad`: "The ticket"
1. **Hero:** "From student project to funded startup." Sub: "Launchpad picks 20 student founders a cohort for four weeks of fully online building with operators and investors, ending in a Demo Day. No equity, ever. 5% only if you raise." Status pill from ONE setting: "Cohort 01 · Applications close Sep 30, 7 PM IST" or, when closed, "Next cohort: join the waitlist".
2. **The deal** `#terms`: the orange ticket from the homepage, with the full terms table from section 3.
3. **How it works:** a path of 4 stops: Apply (₹999, fee waivers available) → Selection (20 founders; everyone else gets feedback, a month of Startup School and 50% off next time) → Build (4 weeks, pods of 4–5, weekly labs, 1:1 mentors) → Demo Day (pitch to angels and early-stage funds).
4. **What you get:** founder pods, weekly cohort lab, mentor office hours, investor intros, Demo Day, alumni network.
5. **"Not selected? You still leave with something."** The feedback, the free month and the 50% code, shown as a receipt.
6. **Investors & mentors / Results:** hidden until real names and results exist (leave commented placeholders).
7. **FAQ:** What does it cost? · Is admission competitive? · Is it equity-free? · How does the 5% work? · What happens if I'm not selected? · Time commitment (6–8 hrs/week) · Do I need a registered company? (No)
8. Link to the Cohort 01 page and application form: `/launchpad/fellowship`.

### 5.6 Fellowship '26 `/launchpad/fellowship`
Keep the existing page and application form, but restyle it into the new world and update the text to section 3. Specifically:
- Hero stats: 4 Weeks · 20 Founders · 0% Equity · 5% Only if you raise
- Eligibility: "We select 20 founders per cohort based on the problem, your progress and your team, never your college."
- FAQ answers updated to section 3 (cost, competitive, equity, 5%, not selected)
- Form fee box: "₹999 application fee · includes written feedback for every applicant" + "5% success fee · only on money from investors we introduce" + fee-waiver link
- Required checkbox: "I understand the ₹999 application fee is non-refundable, and that TFC charges a one-time 5% success fee on funds raised from investors it introduces."
- Collect the fee at submission using the **same payment method the site already uses**. Don't add a new payment provider.
- Confirmation: "Decisions and feedback go out by [date placeholder]. Selected founders get the founder agreement to sign before kickoff."
- **The form must still submit correctly.** Test it.

### 5.7 Stories `/stories`
1. **Hero:** "People who stepped out of line."
2. **Builder card template:** photo · name, college, year · what they built (one line) · Before: "I was preparing for…" · After: users / revenue / raised / hired · which TFC stop helped · short quote. Store stories in a data file.
3. Ship with **no cards** and the line "First stories arrive after Cohort 01's Demo Day. Want yours here? Join a chapter." Never invent stories.

### 5.8 About `/about`: "The letter"
1. **Why we started:** the founders' letter from the homepage, longer, with photos (placeholders).
2. Vision, mission and values:
   - Access over pedigree: fully online, fee waivers, feedback for every applicant. We select on what you've built, never your college name.
   - Build over talk: we measure what you ship.
   - We win when you win: no equity, ever. Our real upside is 5% when you raise.
   - Community before competition: chapters, pods, alumni.
   - Honest about risk: most startups fail. We show you the safety nets.
   - Builders pay it forward: today's fellows become tomorrow's chapter leads, mentors and investors.
3. **How we make money:** the terms ticket again. Being open about money is part of the brand.
4. **The council:** chapter leads, mentors, advisors (placeholders).
5. **Partners** `/about/partners`: move the existing partners content here.
6. **Hire builders:** a short form for companies that want to hire TFC builders, using the same form handling the site already uses.

### 5.9 Join `/join`
Keep the existing join form. Restyle it into the warm world. Headline: "Step out of line." Mention the 7-day Startup School perk for members.

### 5.10 Terms, Privacy, Refunds
Keep them. Add to Terms and Refunds: the non-refundable ₹999 application fee, the 50%-off reapplication, and the 5% success-fee clause. Mark these additions with a visible note for legal review.

---

## 6. Emails to create (as HTML templates in the repo)

**Not selected**, subject: "Your Launchpad application: feedback and what's next"
> Hi {first_name},
> Thank you for applying to Launchpad {cohort}. We had {n_applicants} applications for 20 seats, and yours wasn't selected this time. Here's our honest read, so the ₹999 goes toward making your next attempt stronger.
> **What's working:** {strengths}
> **What to fix before you reapply:** 1. {fix_1} 2. {fix_2} 3. {fix_3}
> **Your next steps:**
> - One month of Startup School, on us (normally ₹399). Start with {recommended_modules}: {school_link}
> - 50% off your next Launchpad application (₹499). Code: {discount_code}
> Reviewed by {reviewer_name}. Keep building, The Future Council

**Selected**, subject: "You're in: Launchpad {cohort}"
> Hi {first_name}, you're one of 20 founders in Launchpad {cohort}. Kickoff is {kickoff_date}. Before then, please sign the founder agreement (it covers the 2% success fee): {agreement_link}. Your pod and first session details follow this week. See you on the inside, The Future Council

---

## 7. Definition of done

- Every page in section 5 exists, is in the same visual world, and works at 390px with no sideways scroll.
- Every old URL redirects to its new page; no link on the site returns 404.
- A search of the whole site finds none of: "open admission", "no shortlist", "₹999" as the application fee, "₹35", "Branches", "pay only if accepted".
- The fellowship application form submits successfully.
- All placeholders (photos, dates, investors, stories) are listed for the owner.
