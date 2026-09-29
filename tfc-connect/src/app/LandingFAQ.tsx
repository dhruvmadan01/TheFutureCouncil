"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Is TFC Connect really 100% free?",
    answer:
      "Yes, completely free forever. No paywalls, no 'Pro tier', no credit cards, and zero equity cut. TFC Connect is non-monetized infrastructure built by The Future Council to make student entrepreneurship the norm in India.",
  },
  {
    question: "How does the matching algorithm work?",
    answer:
      "Every morning at 8 AM, you receive 5 curated matches based on transparent criteria: complementary skills (35%), commitment timing (20%), industry overlap (15%), location/remote preferences (10%), working style similarity (10%), and profile verification (10%). We explain exactly why you match on every card.",
  },
  {
    question: "What is Chapter Verification and how do I get it?",
    answer:
      "Founders can verify their profile using their official college email or a TFC Chapter Code from one of our 90+ campus chapters (e.g. DU, NSUT, DTU, SRCC, IIT Madras BS, IIIT-D). Verified profiles receive a verified chip and get 3× higher connection response rates.",
  },
  {
    question: "Can I list an early-stage idea or stealth project?",
    answer:
      "Yes! You can list projects at any stage: Idea, Building MVP, Launched, Revenue, or Funded. You decide what to share publicly (one-liner, problem, solution), while pitch decks remain securely stored in private buckets.",
  },
  {
    question: "What is the Founder Fit Kit?",
    answer:
      "The Founder Fit Kit is an interactive 10-question framework built directly into your chat. It guides co-founders through awkward but vital conversations—equity splits, 4-year vesting, weekly hours, decision tie-breaks, and IP rights—before signing legal documents.",
  },
];

export function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      {FAQ_ITEMS.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className="rounded-2xl border border-line bg-card transition-all duration-200 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggle(index)}
              className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-bg/50 transition-colors"
              aria-expanded={isOpen}
            >
              <span className="font-display font-bold text-base sm:text-lg text-ink">
                {item.question}
              </span>
              <ChevronDown
                className={`size-5 text-ink-soft shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-orange" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-6 pb-5 pt-1 text-ink-soft font-sans text-sm sm:text-base leading-relaxed border-t border-line/40">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
