import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using TFC Connect.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-warm text-ink flex flex-col">
      <header className="border-b border-line bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-[900px] mx-auto px-4 sm:px-8 py-4 flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="TFC Connect" width={26} height={26} className="rounded-md" />
            <span className="font-display font-extrabold text-lg text-ink">TFC Connect</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-[900px] mx-auto px-4 sm:px-8 py-12 space-y-10">
        <div className="space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-widest text-orange-deep font-semibold">Legal</p>
          <h1 className="font-display text-4xl font-black text-ink tracking-tight">Terms of Service</h1>
          <p className="font-sans text-ink-soft text-sm">Last updated: October 2026</p>
        </div>

        <div className="space-y-8 font-sans text-sm text-ink leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-display font-bold text-xl text-ink">1. Acceptance</h2>
            <p>By creating an account or using TFC Connect, you agree to these terms. If you disagree, please do not use the platform.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-xl text-ink">2. Eligibility</h2>
            <p>TFC Connect is designed for enrolled or recently graduated students from Indian universities. You must be at least 16 years old to use this platform.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-xl text-ink">3. Your account</h2>
            <ul className="list-disc pl-5 space-y-2 text-ink-soft">
              <li>You are responsible for the accuracy of your profile information.</li>
              <li>You must not impersonate others or create fake accounts.</li>
              <li>You are responsible for keeping your login credentials secure.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-xl text-ink">4. Acceptable use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2 text-ink-soft">
              <li>Spam, harass, or send unsolicited messages to other users.</li>
              <li>Post false, misleading, or fraudulent startup or profile information.</li>
              <li>Attempt to scrape, reverse-engineer, or attack the platform.</li>
              <li>Use the platform for commercial recruitment without our consent.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-xl text-ink">5. Content ownership</h2>
            <p>You retain ownership of content you submit (profiles, startup listings). By submitting, you grant TFC Connect a non-exclusive license to display your content on the platform and in promotional materials related to the platform.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-xl text-ink">6. Co-founder agreements</h2>
            <p className="border-l-2 border-orange pl-4 text-ink-soft italic">
              <strong className="text-ink not-italic">Important:</strong> Any co-founder agreement, equity arrangement, or business relationship formed between users is entirely between those users. TFC Connect provides templates and tools as a convenience only — they are not legal advice. Consult a qualified lawyer before signing any binding agreement.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-xl text-ink">7. Termination</h2>
            <p>We may suspend or terminate accounts that violate these terms. You may delete your account at any time by contacting <a href="mailto:support@thefuturecouncil.in" className="text-orange hover:underline">support@thefuturecouncil.in</a>.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-xl text-ink">8. Disclaimer & limitation of liability</h2>
            <p className="text-ink-soft">The platform is provided &ldquo;as is&rdquo;. The Future Council makes no guarantees about the suitability of any co-founder match, the success of any startup listed, or the accuracy of user-submitted information. We are not liable for any decisions made based on platform interactions.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-xl text-ink">9. Governing law</h2>
            <p>These terms are governed by the laws of India. Disputes shall be subject to the jurisdiction of courts in New Delhi.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-xl text-ink">10. Contact</h2>
            <p><a href="mailto:support@thefuturecouncil.in" className="text-orange hover:underline">support@thefuturecouncil.in</a></p>
          </section>
        </div>
      </main>

      <footer className="border-t border-line px-6 py-5">
        <div className="max-w-[900px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono text-[11px] text-mute">© 2026 The Future Council</p>
          <div className="flex items-center gap-6 font-sans text-xs text-ink-soft">
            <Link href="/privacy" className="hover:text-ink transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-ink transition-colors font-semibold text-ink">Terms of Service</Link>
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
