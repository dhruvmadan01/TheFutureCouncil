import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing SUPABASE env vars in .env.local");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// 30 realistic Indian student profiles
const PROFILES_SEED = [
  // NSUT
  {
    name: "Kabir Anand",
    email: "kabir.anand@nsut.ac.in",
    college: "Netaji Subhas University of Technology",
    city: "Delhi NCR",
    chapterCode: "TFC-NSUT-01",
    headline: "B.Tech CSE '26 · Distributed Systems & ML",
    role: "idea",
    primary_skill: "tech",
    secondary_skills: ["product"],
    looking_for_skills: ["growth", "sales"],
    industries: ["AgriTech", "AI/ML"],
    commitment: "full_time",
    remote_ok: true,
    equity_pref: "equal",
    proof_links: [
      { url: "https://github.com/kabir/dist-cache", title: "Raft Consensus in Go", note: "450 stars on GitHub" },
      { url: "https://sih.gov.in", title: "Smart India Hackathon Finalist", note: "AI crop monitoring" }
    ],
    bio: "Building low-latency infrastructure and applied ML systems. Looking for a growth or business co-founder to take an agri supply tool to market.",
    why_startup: "Farmers lose millions to opaque supply chains. I want to build transparent pricing tech.",
    work_style: { speed: 85, risk: 75, hours: 85, decision: 45 },
    chapter_verified: true,
    is_fellow: true,
  },
  {
    name: "Tanya Verma",
    email: "tanya.verma@nsut.ac.in",
    college: "Netaji Subhas University of Technology",
    city: "Delhi NCR",
    chapterCode: "TFC-NSUT-01",
    headline: "Product Designer & UX Researcher · NSUT Design Cell",
    role: "join",
    primary_skill: "design",
    secondary_skills: ["product"],
    looking_for_skills: ["tech", "domain"],
    industries: ["EdTech", "FinTech", "Health"],
    commitment: "full_time",
    remote_ok: true,
    equity_pref: "equal",
    proof_links: [
      { url: "https://behance.net/tanya-ux", title: "FinFlow: Neobank for GenZ", note: "Case study with 20 user interviews" },
      { url: "https://figma.com/@tanya", title: "Design System Kit", note: "Used by 3 campus hackathons" }
    ],
    bio: "Obsessed with clean, zero-friction mobile interfaces and delightful UX for Indian users.",
    why_startup: "Great products win on UX, and most Indian software feels like a 2012 desktop portal.",
    work_style: { speed: 70, risk: 60, hours: 80, decision: 30 },
    chapter_verified: true,
    is_fellow: false,
  },
  {
    name: "Raghav Mehra",
    email: "raghav.mehra@nsut.ac.in",
    college: "Netaji Subhas University of Technology",
    city: "Delhi NCR",
    chapterCode: "TFC-NSUT-01",
    headline: "Full Stack Dev · Prev. SDE Intern at Swiggy",
    role: "either",
    primary_skill: "tech",
    secondary_skills: ["ops"],
    looking_for_skills: ["product", "growth"],
    industries: ["Consumer", "SaaS", "FinTech"],
    commitment: "full_time",
    remote_ok: true,
    equity_pref: "open",
    proof_links: [
      { url: "https://github.com/raghav/quick-pay", title: "UPI Payment Routing SDK", note: "Benchmarked 120ms latency" },
    ],
    bio: "React, Node.js, PostgreSQL and Redis. Love shipping fast MVPs over long weekends.",
    why_startup: "I want to own end-to-end architecture from first commit to production scale.",
    work_style: { speed: 90, risk: 80, hours: 90, decision: 40 },
    chapter_verified: true,
    is_fellow: false,
  },

  // DU North
  {
    name: "Aaditya Singhania",
    email: "aaditya.singh@kmc.du.ac.in",
    college: "Kirori Mal College (DU)",
    city: "Delhi NCR",
    chapterCode: "TFC-DU-01",
    headline: "Economics Hons · President, DU E-Cell",
    role: "idea",
    primary_skill: "growth",
    secondary_skills: ["sales"],
    looking_for_skills: ["tech", "product"],
    industries: ["FinTech", "Consumer", "EdTech"],
    commitment: "full_time",
    remote_ok: true,
    equity_pref: "equal",
    proof_links: [
      { url: "https://linkedin.com/in/aaditya-s", title: "Scaled DU E-Summit to 8,000 students", note: "Raised ₹14L sponsorship" },
      { url: "https://medium.com/@aaditya/upi-credit", title: "Analysis: UPI on Credit Cards", note: "15k reads on Substack" }
    ],
    bio: "Growth marketer and community architect. Managed 40 campus ambassadors across North Campus.",
    why_startup: "College students spend hours hunting for deals. I want to build social micro-saving.",
    work_style: { speed: 85, risk: 80, hours: 85, decision: 60 },
    chapter_verified: true,
    is_fellow: true,
  },
  {
    name: "Rhea Chawla",
    email: "rhea.chawla@miranda.du.ac.in",
    college: "Miranda House (DU)",
    city: "Delhi NCR",
    chapterCode: "TFC-DU-01",
    headline: "Political Science & Economics · Policy & Research",
    role: "join",
    primary_skill: "domain",
    secondary_skills: ["growth"],
    looking_for_skills: ["tech", "product"],
    industries: ["Climate", "AgriTech", "EdTech"],
    commitment: "full_time",
    remote_ok: true,
    equity_pref: "equal",
    proof_links: [
      { url: "https://researchgate.net/publication/rhea-climate", title: "Delhi Air Quality & EV Policies", note: "Presented at TERI" },
    ],
    bio: "Deep domain research on carbon credits, renewable policies, and grassroots EV transition.",
    why_startup: "Policy without software is slow; software backed by domain knowledge changes behavior.",
    work_style: { speed: 65, risk: 50, hours: 75, decision: 25 },
    chapter_verified: true,
    is_fellow: false,
  },
  {
    name: "Ishaan Kapoor",
    email: "ishaan.kapoor@ramjas.du.ac.in",
    college: "Ramjas College (DU)",
    city: "Delhi NCR",
    chapterCode: "TFC-DU-01",
    headline: "Statistics Hons · Quantitative Modeling & Analytics",
    role: "either",
    primary_skill: "ops",
    secondary_skills: ["tech"],
    looking_for_skills: ["product", "growth"],
    industries: ["FinTech", "SaaS"],
    commitment: "part_time",
    remote_ok: true,
    equity_pref: "open",
    proof_links: [
      { url: "https://github.com/ishaan/nifty-options", title: "Options Pricing Engine in Python", note: "Backtested over 5 years" }
    ],
    bio: "Obsessed with numbers, CAC/LTV unit economics, and building lean automated operational systems.",
    why_startup: "I want to build software that replaces painful manual spreadsheet workflows.",
    work_style: { speed: 60, risk: 50, hours: 65, decision: 15 },
    chapter_verified: true,
    is_fellow: false,
  },

  // SRCC
  {
    name: "Pranav Goel",
    email: "pranav.goel@srcc.du.ac.in",
    college: "Shri Ram College of Commerce",
    city: "Delhi NCR",
    chapterCode: "TFC-SRCC-01",
    headline: "B.Com Hons · Financial Modeling & Venture Capital Enthusiast",
    role: "idea",
    primary_skill: "sales",
    secondary_skills: ["ops"],
    looking_for_skills: ["tech", "design"],
    industries: ["FinTech", "B2B", "SaaS"],
    commitment: "full_time",
    remote_ok: true,
    equity_pref: "equal",
    proof_links: [
      { url: "https://linkedin.com/in/pranav-srcc", title: "National Case Comp Winner (IIM-A)", note: "Built 3-statement model" },
      { url: "https://github.com/pranav/b2b-leads", title: "B2B Outreach Playbook", note: "35% reply rate over 500 emails" }
    ],
    bio: "Top 1% financial modeler at SRCC. High conviction on B2B accounting and invoice financing for MSMEs.",
    why_startup: "Indian MSMEs run on paper udhaar. Bringing them into digital credit is a $100B opportunity.",
    work_style: { speed: 80, risk: 70, hours: 85, decision: 45 },
    chapter_verified: true,
    is_fellow: true,
  },
  {
    name: "Sanvi Kothari",
    email: "sanvi.kothari@srcc.du.ac.in",
    college: "Shri Ram College of Commerce",
    city: "Delhi NCR",
    chapterCode: "TFC-SRCC-01",
    headline: "Growth Lead · Grew campus D2C brand to ₹12L GMV",
    role: "join",
    primary_skill: "growth",
    secondary_skills: ["sales"],
    looking_for_skills: ["tech", "product"],
    industries: ["Consumer", "EdTech", "Social"],
    commitment: "full_time",
    remote_ok: true,
    equity_pref: "equal",
    proof_links: [
      { url: "https://instagram.com/campusbrands", title: "Campus Brand Pilot", note: "₹12L GMV in 4 months" },
    ],
    bio: "Performance marketing, organic influencer pipelines, and retention psychology.",
    why_startup: "I want to be the growth co-founder alongside an insane tech hacker.",
    work_style: { speed: 90, risk: 80, hours: 80, decision: 50 },
    chapter_verified: true,
    is_fellow: true,
  },
  {
    name: "Varun Bajaj",
    email: "varun.bajaj@srcc.du.ac.in",
    college: "Shri Ram College of Commerce",
    city: "Delhi NCR",
    chapterCode: "TFC-SRCC-01",
    headline: "Economics & Strategy · Lead, SRCC Consulting Club",
    role: "either",
    primary_skill: "product",
    secondary_skills: ["ops"],
    looking_for_skills: ["tech", "design"],
    industries: ["B2B", "SaaS", "FinTech"],
    commitment: "full_time",
    remote_ok: true,
    equity_pref: "equal",
    proof_links: [
      { url: "https://srccconsulting.com/cases/logistics", title: "Hyperlocal Logistics Teardown", note: "Consulted for Tier-2 3PL" }
    ],
    bio: "Skilled in customer discovery, roadmapping, and translating complex customer pain into wireframes.",
    why_startup: "Corporate consulting tells people what to do; startups actually build the solution.",
    work_style: { speed: 75, risk: 65, hours: 80, decision: 35 },
    chapter_verified: true,
    is_fellow: false,
  },

  // DTU
  {
    name: "Nikhil Sharma",
    email: "nikhil.sharma@dtu.ac.in",
    college: "Delhi Technological University",
    city: "Delhi NCR",
    chapterCode: "TFC-DTU-01",
    headline: "B.Tech Software Engineering · Full Stack & Web3",
    role: "join",
    primary_skill: "tech",
    secondary_skills: ["product"],
    looking_for_skills: ["growth", "sales"],
    industries: ["AI/ML", "FinTech", "SaaS"],
    commitment: "full_time",
    remote_ok: true,
    equity_pref: "equal",
    proof_links: [
      { url: "https://github.com/nikhil/sol-dex", title: "Decentralized Escrow in Rust", note: "Audited by campus security lab" },
      { url: "https://ethglobal.com", title: "ETHGlobal Hackathon Winner", note: "$5k prize pool" }
    ],
    bio: "Low-level system architecture, Rust, Solidity, TypeScript and Next.js.",
    why_startup: "Tired of big tech hiring freezes and pointless tickets. I want to build a real product.",
    work_style: { speed: 85, risk: 85, hours: 90, decision: 45 },
    chapter_verified: true,
    is_fellow: true,
  },
  {
    name: "Kritika Saini",
    email: "kritika.saini@dtu.ac.in",
    college: "Delhi Technological University",
    city: "Delhi NCR",
    chapterCode: "TFC-DTU-01",
    headline: "Robotics & Automation · IoT & Hardware",
    role: "idea",
    primary_skill: "tech",
    secondary_skills: ["domain"],
    looking_for_skills: ["product", "sales"],
    industries: ["Climate", "AgriTech", "B2B"],
    commitment: "full_time",
    remote_ok: false,
    equity_pref: "equal",
    proof_links: [
      { url: "https://github.com/kritika/solar-tracker", title: "Dual-Axis Solar Tracker Microcontroller", note: "Boosted panel yield 22%" }
    ],
    bio: "Embedded systems, sensors, MQTT and edge computation for industrial and green tech.",
    why_startup: "India needs climate hardware innovation, not just another delivery app.",
    work_style: { speed: 65, risk: 70, hours: 80, decision: 25 },
    chapter_verified: true,
    is_fellow: false,
  },
  {
    name: "Arnav Sethi",
    email: "arnav.sethi@dtu.ac.in",
    college: "Delhi Technological University",
    city: "Delhi NCR",
    chapterCode: "TFC-DTU-01",
    headline: "AI Engineer · Fine-tuning LLMs for Indian Vernacular",
    role: "either",
    primary_skill: "tech",
    secondary_skills: ["design"],
    looking_for_skills: ["growth", "domain"],
    industries: ["AI/ML", "EdTech", "Health"],
    commitment: "full_time",
    remote_ok: true,
    equity_pref: "equal",
    proof_links: [
      { url: "https://huggingface.co/arnav/hindi-llama", title: "Hindi LLaMA LoRA Weights", note: "10k downloads" },
      { url: "https://github.com/arnav/voice-bot", title: "Realtime Voice AI Agent", note: "Sub-400ms audio turnaround" }
    ],
    bio: "Building voice-first AI agents in Hindi, Marathi, and Tamil. Looking for distribution partner.",
    why_startup: "The next 400M internet users will interact through voice, not keyboards.",
    work_style: { speed: 90, risk: 90, hours: 90, decision: 50 },
    chapter_verified: true,
    is_fellow: true,
  },

  // IIT Madras BS
  {
    name: "Siddharth Rao",
    email: "siddharth.rao@iitm.ac.in",
    college: "IIT Madras BS Degree",
    city: "Bengaluru",
    chapterCode: "TFC-IITMBS-01",
    headline: "Data Science & Applications · Machine Learning & MLops",
    role: "join",
    primary_skill: "tech",
    secondary_skills: ["product"],
    looking_for_skills: ["sales", "growth"],
    industries: ["AI/ML", "Health", "FinTech"],
    commitment: "full_time",
    remote_ok: true,
    equity_pref: "equal",
    proof_links: [
      { url: "https://kaggle.com/siddharth-rao", title: "Kaggle Grandmaster", note: "Top 0.1% globally in tabular models" },
      { url: "https://github.com/siddharth/fraud-detector", title: "Real-time Credit Card Fraud Detection", note: "Kafka + Fastify" }
    ],
    bio: "IITM BS in Data Science based in Bengaluru. Love scalable data pipelines and statistical modeling.",
    why_startup: "AI is only useful if it solves boring, expensive unit economics in old industries.",
    work_style: { speed: 80, risk: 70, hours: 85, decision: 20 },
    chapter_verified: true,
    is_fellow: true,
  },
  {
    name: "Anwita Menon",
    email: "anwita.menon@iitm.ac.in",
    college: "IIT Madras BS Degree",
    city: "Chennai",
    chapterCode: "TFC-IITMBS-01",
    headline: "Data Science · Healthcare Informatics Enthusiast",
    role: "idea",
    primary_skill: "domain",
    secondary_skills: ["tech"],
    looking_for_skills: ["growth", "sales"],
    industries: ["Health", "AI/ML"],
    commitment: "full_time",
    remote_ok: true,
    equity_pref: "equal",
    proof_links: [
      { url: "https://github.com/anwita/ehr-parser", title: "Doctor Prescription OCR & Normalizer", note: "88% accuracy on handwriting" }
    ],
    bio: "Working on structured EHR extraction for Indian clinics without expensive equipment.",
    why_startup: "Patient records in India are lost in physical paper files. Preventive care requires clean data.",
    work_style: { speed: 70, risk: 65, hours: 80, decision: 30 },
    chapter_verified: true,
    is_fellow: false,
  },
  {
    name: "Karthik Sundaram",
    email: "karthik.s@iitm.ac.in",
    college: "IIT Madras BS Degree",
    city: "Bengaluru",
    chapterCode: "TFC-IITMBS-01",
    headline: "Full-Stack + Data Engineering · Python / React / AWS",
    role: "join",
    primary_skill: "tech",
    secondary_skills: ["ops"],
    looking_for_skills: ["design", "product"],
    industries: ["SaaS", "B2B", "FinTech"],
    commitment: "full_time",
    remote_ok: true,
    equity_pref: "open",
    proof_links: [
      { url: "https://github.com/karthik/etl-lake", title: "DuckDB + S3 Analytics Pipeline", note: "Processed 50M rows in seconds" }
    ],
    bio: "Practical builder with 3 years hands-on coding. Comfortable across database, backend, and frontend.",
    why_startup: "I want to be the founding engineer / technical co-founder on an ambitious B2B product.",
    work_style: { speed: 85, risk: 60, hours: 85, decision: 35 },
    chapter_verified: true,
    is_fellow: false,
  },

  // Additional 15 diverse student profiles across these colleges
  {
    name: "Meera Sen",
    email: "meera.sen@srcc.du.ac.in",
    college: "Shri Ram College of Commerce",
    city: "Delhi NCR",
    chapterCode: "TFC-SRCC-01",
    headline: "FinTech Product Thinker · Micro-investing for Bharat",
    role: "idea",
    primary_skill: "product",
    secondary_skills: ["growth"],
    looking_for_skills: ["tech", "design"],
    industries: ["FinTech", "Consumer"],
    commitment: "full_time",
    remote_ok: true,
    equity_pref: "equal",
    proof_links: [
      { url: "https://notion.so/meera/fintech-prds", title: "UPI SIP Product Teardown", note: "Interactive prototype in Framer" }
    ],
    bio: "Passionate about behavioral finance and making gold/equity savings accessible for Tier-2 students.",
    why_startup: "Financial literacy isn't enough; products must automate savings without thinking.",
    work_style: { speed: 75, risk: 65, hours: 80, decision: 40 },
    chapter_verified: true,
    is_fellow: true,
  },
  {
    name: "Harshavardhan Reddy",
    email: "harsha.reddy@iitm.ac.in",
    college: "IIT Madras BS Degree",
    city: "Hyderabad",
    chapterCode: "TFC-IITMBS-01",
    headline: "Backend Engineer & Cloud Native Architect",
    role: "join",
    primary_skill: "tech",
    secondary_skills: ["ops"],
    looking_for_skills: ["product", "growth"],
    industries: ["B2B", "SaaS", "Climate"],
    commitment: "full_time",
    remote_ok: true,
    equity_pref: "equal",
    proof_links: [
      { url: "https://github.com/harsha/k8s-scaler", title: "Kubernetes Event Scaler", note: "Optimized server bills by 40%" }
    ],
    bio: "Go, Kubernetes, Postgres, and high-concurrency microservices. Ex-intern at startup incubator.",
    why_startup: "I want to solve heavy technical scaling challenges alongside a visionary CEO.",
    work_style: { speed: 80, risk: 70, hours: 85, decision: 35 },
    chapter_verified: true,
    is_fellow: false,
  },
  {
    name: "Devika Nair",
    email: "devika.nair@nsut.ac.in",
    college: "Netaji Subhas University of Technology",
    city: "Delhi NCR",
    chapterCode: "TFC-NSUT-01",
    headline: "Product Marketing & Video Storyteller · 50k on YouTube",
    role: "join",
    primary_skill: "growth",
    secondary_skills: ["design"],
    looking_for_skills: ["tech", "product"],
    industries: ["EdTech", "Consumer", "Social"],
    commitment: "full_time",
    remote_ok: true,
    equity_pref: "equal",
    proof_links: [
      { url: "https://youtube.com/@devikabuilds", title: "Student Founder Stories", note: "50k subscribers, 1.2M views" }
    ],
    bio: "I turn complex developer tools and tech into magnetic short-form video and high-converting launch funnels.",
    why_startup: "The best product with zero attention dies. I bring the attention.",
    work_style: { speed: 95, risk: 85, hours: 80, decision: 60 },
    chapter_verified: true,
    is_fellow: true,
  },
  {
    name: "Ayush Tiwari",
    email: "ayush.tiwari@dtu.ac.in",
    college: "Delhi Technological University",
    city: "Delhi NCR",
    chapterCode: "TFC-DTU-01",
    headline: "Competitive Programmer (Codeforces 2050) & Algorithms",
    role: "join",
    primary_skill: "tech",
    secondary_skills: ["domain"],
    looking_for_skills: ["product", "sales"],
    industries: ["SaaS", "FinTech", "AI/ML"],
    commitment: "full_time",
    remote_ok: true,
    equity_pref: "equal",
    proof_links: [
      { url: "https://codeforces.com/profile/ayush_t", title: "Codeforces Candidate Master", note: "Ranked top 1% in India" },
      { url: "https://github.com/ayush/graph-db", title: "Mini In-Memory Graph Index", note: "C++ with custom hash maps" }
    ],
    bio: "C++, Python, Rust. Give me any complex algorithmic bottleneck and I'll make it 10x faster.",
    why_startup: "I want to apply hardcore algorithms to solve real infrastructure problems.",
    work_style: { speed: 70, risk: 65, hours: 85, decision: 15 },
    chapter_verified: true,
    is_fellow: false,
  },
  {
    name: "Simran Bhatia",
    email: "simran.bhatia@kmc.du.ac.in",
    college: "Kirori Mal College (DU)",
    city: "Delhi NCR",
    chapterCode: "TFC-DU-01",
    headline: "B2B Sales & BD · Closed ₹8L campus partnerships",
    role: "join",
    primary_skill: "sales",
    secondary_skills: ["growth"],
    looking_for_skills: ["tech", "product"],
    industries: ["B2B", "EdTech", "Consumer"],
    commitment: "full_time",
    remote_ok: true,
    equity_pref: "equal",
    proof_links: [
      { url: "https://linkedin.com/in/simran-bhatia-bd", title: "Campus Partnership Playbook", note: "Closed 12 student housing tie-ups" }
    ],
    bio: "Fearless cold-caller, pipeline builder, and relationship manager. I love talking to customers every single day.",
    why_startup: "Founders who hide behind code need a partner who loves knocking on doors.",
    work_style: { speed: 85, risk: 75, hours: 80, decision: 55 },
    chapter_verified: true,
    is_fellow: false,
  },
  {
    name: "Rohan Kapoor",
    email: "rohan.kapoor@srcc.du.ac.in",
    college: "Shri Ram College of Commerce",
    city: "Delhi NCR",
    chapterCode: "TFC-SRCC-01",
    headline: "Operations & Logistics Architect · E-Commerce Operations",
    role: "idea",
    primary_skill: "ops",
    secondary_skills: ["sales"],
    looking_for_skills: ["tech", "product"],
    industries: ["AgriTech", "Consumer", "B2B"],
    commitment: "full_time",
    remote_ok: true,
    equity_pref: "equal",
    proof_links: [
      { url: "https://linkedin.com/in/rohan-kapoor-ops", title: "Last-Mile Delivery Study in Okhla Mandi", note: "Mapped 45 freight routes" }
    ],
    bio: "Obsessed with on-the-ground physical fulfillment, mandi operations, and warehouse tracking.",
    why_startup: "India's growth is held back by fragmented supply chain logistics. I want to build the operating system for mandis.",
    work_style: { speed: 80, risk: 75, hours: 85, decision: 40 },
    chapter_verified: true,
    is_fellow: true,
  },
  {
    name: "Pooja Hegde",
    email: "pooja.hegde@iitm.ac.in",
    college: "IIT Madras BS Degree",
    city: "Bengaluru",
    chapterCode: "TFC-IITMBS-01",
    headline: "Computer Vision & Edge AI · Embedded Deep Learning",
    role: "join",
    primary_skill: "tech",
    secondary_skills: ["product"],
    looking_for_skills: ["growth", "sales"],
    industries: ["Climate", "AgriTech", "Health"],
    commitment: "full_time",
    remote_ok: true,
    equity_pref: "equal",
    proof_links: [
      { url: "https://github.com/pooja/leaf-disease", title: "Plant Leaf Disease Detection on Raspberry Pi", note: "94% mAP score" }
    ],
    bio: "PyTorch, TensorRT, YOLO, OpenCV. Building fast vision models that run directly on edge devices without cloud costs.",
    why_startup: "Rural and farm applications have poor 4G connectivity; vision models must run offline.",
    work_style: { speed: 75, risk: 70, hours: 80, decision: 25 },
    chapter_verified: true,
    is_fellow: false,
  },
  {
    name: "Akash Deep",
    email: "akash.deep@dtu.ac.in",
    college: "Delhi Technological University",
    city: "Delhi NCR",
    chapterCode: "TFC-DTU-01",
    headline: "Product Manager & Hacker · Shipped 4 Micro-SaaS tools",
    role: "idea",
    primary_skill: "product",
    secondary_skills: ["tech"],
    looking_for_skills: ["growth", "sales"],
    industries: ["SaaS", "AI/ML", "B2B"],
    commitment: "full_time",
    remote_ok: true,
    equity_pref: "equal",
    proof_links: [
      { url: "https://resume-roast.ai", title: "ResumeRoast AI", note: "35k resumes reviewed, $1.4k MRR" },
      { url: "https://github.com/akash/open-changelog", title: "OpenChangelog", note: "1.1k GitHub stars" }
    ],
    bio: "Serial builder. Fast prototyper in Next.js, Supabase and Stripe. Need a partner to scale distribution and enterprise sales.",
    why_startup: "I love the 0 to 1 product phase and obsessing over early churn and activation.",
    work_style: { speed: 95, risk: 80, hours: 90, decision: 45 },
    chapter_verified: true,
    is_fellow: true,
  },
  {
    name: "Sneha Nair",
    email: "sneha.nair@miranda.du.ac.in",
    college: "Miranda House (DU)",
    city: "Delhi NCR",
    chapterCode: "TFC-DU-01",
    headline: "UI/UX & Design Systems · Lead Designer at HackDelhi",
    role: "join",
    primary_skill: "design",
    secondary_skills: ["product"],
    looking_for_skills: ["tech", "growth"],
    industries: ["Consumer", "Health", "Social"],
    commitment: "full_time",
    remote_ok: true,
    equity_pref: "equal",
    proof_links: [
      { url: "https://dribbble.com/sneha-designs", title: "Mental Health App Concept", note: "Featured on Dribbble daily picks" }
    ],
    bio: "Micro-interactions, typography, and human-centered design for consumer apps.",
    why_startup: "Most healthcare and wellness apps cause more anxiety than they cure. Designing for calm.",
    work_style: { speed: 80, risk: 65, hours: 75, decision: 35 },
    chapter_verified: true,
    is_fellow: false,
  },
  {
    name: "Gaurav Malhotra",
    email: "gaurav.malhotra@nsut.ac.in",
    college: "Netaji Subhas University of Technology",
    city: "Delhi NCR",
    chapterCode: "TFC-NSUT-01",
    headline: "Mobile Dev (React Native & Flutter) · Shipped to Play Store",
    role: "join",
    primary_skill: "tech",
    secondary_skills: ["design"],
    looking_for_skills: ["product", "growth"],
    industries: ["Consumer", "FinTech", "EdTech"],
    commitment: "full_time",
    remote_ok: true,
    equity_pref: "equal",
    proof_links: [
      { url: "https://play.google.com/store/apps/details?id=com.campusconnect", title: "CampusConnect App", note: "10,000+ downloads, 4.6★" }
    ],
    bio: "Cross-platform mobile engineer who cares deeply about 60fps animations and offline-first persistence.",
    why_startup: "Mobile is where Indian consumers live. Ready to build the next breakout consumer app.",
    work_style: { speed: 85, risk: 75, hours: 85, decision: 40 },
    chapter_verified: true,
    is_fellow: true,
  },
  {
    name: "Nandini Iyer",
    email: "nandini.iyer@iitm.ac.in",
    college: "IIT Madras BS Degree",
    city: "Chennai",
    chapterCode: "TFC-IITMBS-01",
    headline: "NLP Specialist & Data Scientist · Transformer Architectures",
    role: "either",
    primary_skill: "tech",
    secondary_skills: ["domain"],
    looking_for_skills: ["product", "sales"],
    industries: ["EdTech", "AI/ML"],
    commitment: "full_time",
    remote_ok: true,
    equity_pref: "equal",
    proof_links: [
      { url: "https://github.com/nandini/exam-solver", title: "CBSE Math Question Solver & Explainer", note: "Step-by-step reasoning tree" }
    ],
    bio: "Building personalized AI tutoring that adapts to each student's pace and misconception patterns.",
    why_startup: "Private tuition costs ₹30,000/yr. AI can give every student an affordable world-class 1-on-1 mentor.",
    work_style: { speed: 80, risk: 80, hours: 85, decision: 30 },
    chapter_verified: true,
    is_fellow: false,
  },
  {
    name: "Chirag Agrawal",
    email: "chirag.agrawal@srcc.du.ac.in",
    college: "Shri Ram College of Commerce",
    city: "Delhi NCR",
    chapterCode: "TFC-SRCC-01",
    headline: "Campus D2C Founder · Organic Brand & Community Builder",
    role: "idea",
    primary_skill: "growth",
    secondary_skills: ["sales"],
    looking_for_skills: ["tech", "ops"],
    industries: ["Consumer", "Health"],
    commitment: "full_time",
    remote_ok: true,
    equity_pref: "equal",
    proof_links: [
      { url: "https://linkedin.com/in/chirag-agrawal-brand", title: "Protein Snacks Pilot", note: "Sold 3,000 units in Delhi colleges" }
    ],
    bio: "Deep understanding of consumer taste, Instagram brand loops, and college distribution.",
    why_startup: "Clean label food for young India is an untapped $10B space. Ready to go all-in.",
    work_style: { speed: 90, risk: 85, hours: 85, decision: 65 },
    chapter_verified: true,
    is_fellow: true,
  },
  {
    name: "Aditi Deshmukh",
    email: "aditi.deshmukh@dtu.ac.in",
    college: "Delhi Technological University",
    city: "Delhi NCR",
    chapterCode: "TFC-DTU-01",
    headline: "Backend Engineer & Database Optimization · Postgres Internals",
    role: "join",
    primary_skill: "tech",
    secondary_skills: ["ops"],
    looking_for_skills: ["product", "growth"],
    industries: ["FinTech", "SaaS", "B2B"],
    commitment: "full_time",
    remote_ok: true,
    equity_pref: "equal",
    proof_links: [
      { url: "https://github.com/aditi/pg-query-optimizer", title: "Automated Postgres Index Analyzer", note: "Adopted by 5 YC startups" }
    ],
    bio: "Database reliability, transaction locking, and high-throughput financial pipelines.",
    why_startup: "Every startup hits database bottlenecks once they scale. I want to build systems that never break.",
    work_style: { speed: 75, risk: 60, hours: 80, decision: 20 },
    chapter_verified: true,
    is_fellow: false,
  },
  {
    name: "Manish Joshi",
    email: "manish.joshi@ramjas.du.ac.in",
    college: "Ramjas College (DU)",
    city: "Delhi NCR",
    chapterCode: "TFC-DU-01",
    headline: "Campus Lead & Community Builder · 10+ Hackathons Organized",
    role: "join",
    primary_skill: "growth",
    secondary_skills: ["sales"],
    looking_for_skills: ["tech", "product"],
    industries: ["Social", "Consumer", "EdTech"],
    commitment: "full_time",
    remote_ok: true,
    equity_pref: "equal",
    proof_links: [
      { url: "https://linkedin.com/in/manish-joshi-tfc", title: "Organizer, HackTheNorth", note: "1,400 participants across 18 universities" }
    ],
    bio: "Natural connector. I know hundreds of ambitious developers and student founders across NCR.",
    why_startup: "I want to lead developer relations or campus growth for an early-stage team.",
    work_style: { speed: 85, risk: 75, hours: 80, decision: 50 },
    chapter_verified: true,
    is_fellow: false,
  },
  {
    name: "Shreya Mukherjee",
    email: "shreya.m@nsut.ac.in",
    college: "Netaji Subhas University of Technology",
    city: "Delhi NCR",
    chapterCode: "TFC-NSUT-01",
    headline: "Full Stack + DevOps · Next.js 15, Docker & Terraform",
    role: "either",
    primary_skill: "tech",
    secondary_skills: ["product"],
    looking_for_skills: ["growth", "sales"],
    industries: ["SaaS", "Climate", "B2B"],
    commitment: "full_time",
    remote_ok: true,
    equity_pref: "equal",
    proof_links: [
      { url: "https://github.com/shreya/carbon-tracker", title: "Scope 1 & 2 Carbon Reporting Tool", note: "Full Next.js + Tailwind webapp" }
    ],
    bio: "Pragmatic full-stack engineer. Ship clean code, write great tests, and keep CI/CD pipelines green.",
    why_startup: "Corporate SDE jobs feel repetitive. I want to build products that I can proudly point to.",
    work_style: { speed: 85, risk: 70, hours: 85, decision: 35 },
    chapter_verified: true,
    is_fellow: true,
  },
];

async function seed() {
  console.log("=== SEEDING 30 REALISTIC INDIAN STUDENT PROFILES ===");

  // Get chapter ID map
  const { data: chapters } = await admin.from("chapters").select("id, code");
  const chapterMap = new Map();
  chapters?.forEach((c) => chapterMap.set(c.code, c.id));

  let createdCount = 0;
  let updatedCount = 0;

  for (let i = 0; i < PROFILES_SEED.length; i++) {
    const p = PROFILES_SEED[i];
    const password = "TfcStudentPass2026!#";

    // 1. Check if auth user exists
    const { data: userList } = await admin.auth.admin.listUsers();
    let authUser = userList.users.find((u) => u.email === p.email);

    if (!authUser) {
      const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
        email: p.email,
        password,
        email_confirm: true,
        user_metadata: { full_name: p.name },
      });
      if (createErr) {
        console.error(`Failed to create ${p.email}:`, createErr.message);
        continue;
      }
      authUser = newUser.user;
      createdCount++;
    } else {
      updatedCount++;
    }

    const chapterId = p.chapterCode ? chapterMap.get(p.chapterCode) : null;
    const now = new Date().toISOString();

    // 2. Update profiles table
    const { error: profileErr } = await admin.from("profiles").update({
      full_name: p.name,
      headline: p.headline,
      college: p.college,
      city: p.city,
      chapter_id: chapterId,
      chapter_verified: p.chapter_verified,
      is_fellow: p.is_fellow,
      role: p.role,
      primary_skill: p.primary_skill,
      secondary_skills: p.secondary_skills,
      looking_for_skills: p.looking_for_skills,
      industries: p.industries,
      commitment: p.commitment,
      remote_ok: p.remote_ok,
      equity_pref: p.equity_pref,
      proof_links: p.proof_links,
      bio: p.bio,
      why_startup: p.why_startup,
      work_style: p.work_style,
      open_to_join: p.role === "join" || p.role === "either",
      onboarding_complete: true,
      hidden: false,
      hide_from_own_college: false,
      last_active_at: now,
      still_looking_at: now,
      updated_at: now,
    }).eq("id", authUser.id);

    if (profileErr) {
      console.error(`Profile update error for ${p.name}:`, profileErr.message);
    }

    // 3. Update profile_contacts table
    await admin.from("profile_contacts").upsert({
      user_id: authUser.id,
      email: p.email,
      linkedin_url: `https://linkedin.com/in/${p.name.toLowerCase().replace(/\s+/g, "-")}`,
      phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
    });

    console.log(`[${i + 1}/30] Configured: ${p.name} (${p.college}) · ${p.primary_skill.toUpperCase()}`);
  }

  console.log(`\n✓ Total Profiles: ${createdCount} created, ${updatedCount} updated.`);

  // 4. Run compute_daily_matches for all eligible profiles
  console.log("\nComputing daily matches across all active profiles...");
  const { data: totalMatches, error: matchErr } = await admin.rpc("compute_daily_matches", { per_user: 5 });
  if (matchErr) {
    console.error("Match computation error:", matchErr.message);
  } else {
    console.log(`✓ Daily matching complete! Inserted ${totalMatches} match pairings into matches_daily.`);
  }

  console.log("\n=== SEED COMPLETE ===");
}

seed().catch(console.error);
