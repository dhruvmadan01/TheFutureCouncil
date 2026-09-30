import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How TFC Connect collects and uses your personal data.",
};

export default function PrivacyPage() {
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
          <h1 className="font-display text-4xl font-black text-ink tracking-tight">Privacy Policy</h1>
          <p className="font-sans text-ink-soft text-sm">Last updated: October 2026</p>
        </div>

        <div className="prose-like space-y-8 font-sans text-sm text-ink leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-display font-bold text-xl text-ink">1. Who we are</h2>
            <p>TFC Connect (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;the platform&rdquo;) is operated by The Future Council, an initiative for campus founders across India. Contact: <a href="mailto:support@thefuturecouncil.in" className="text-orange hover:underline">support@thefuturecouncil.in</a>.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-xl text-ink">2. What we collect</h2>
            <ul className="space-y-2 list-disc pl-5 text-ink-soft">
              <li><strong className="text-ink">Account information</strong> — name, email address, university/college, profile photo.</li>
              <li><strong className="text-ink">Profile data</strong> — skills, headline, working hours, proof-of-work links you choose to share.</li>
              <li><strong className="text-ink">Startup listings</strong> — startup name, description, logo, and team details you submit.</li>
              <li><strong className="text-ink">Usage data</strong> — pages visited, clicks, match interactions (via Mixpanel/PostHog, anonymised).</li>
              <li><strong className="text-ink">Messages</strong> — messages you send to connections through the platform.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-xl text-ink">3. How we use it</h2>
            <ul className="space-y-2 list-disc pl-5 text-ink-soft">
              <li>To create and maintain your account and profile.</li>
              <li>To compute daily co-founder matches based on your skills and preferences.</li>
              <li>To send transactional emails (magic links, connection requests, system notifications).</li>
              <li>To improve the platform using aggregated, anonymised analytics.</li>
              <li><strong className="text-ink">We do not sell your data to third parties.</strong></li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-xl text-ink">4. Contact details visibility</h2>
            <p>Your email address and direct contact details are <strong>never shown publicly</strong>. They are only shared with another user after a connection request is mutually accepted by both parties, enforced server-side via Row-Level Security.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-xl text-ink">5. Data retention & deletion</h2>
            <p>You may request deletion of your account and all associated data at any time by emailing <a href="mailto:support@thefuturecouncil.in" className="text-orange hover:underline">support@thefuturecouncil.in</a>. We will process requests within 30 days.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-xl text-ink">6. Third-party services</h2>
            <p className="text-ink-soft">We use: <strong className="text-ink">Supabase</strong> (database & auth, GDPR-compliant), <strong className="text-ink">Resend</strong> (transactional email), <strong className="text-ink">Mixpanel</strong> (product analytics), <strong className="text-ink">PostHog</strong> (session analytics). Each is bound by their respective data processing agreements.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-xl text-ink">7. Contact</h2>
            <p>Questions about this policy: <a href="mailto:support@thefuturecouncil.in" className="text-orange hover:underline">support@thefuturecouncil.in</a></p>
          </section>
        </div>
      </main>

      <footer className="border-t border-line px-6 py-5">
        <div className="max-w-[900px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono text-[11px] text-mute">© 2026 The Future Council</p>
          <div className="flex items-center gap-6 font-sans text-xs text-ink-soft">
            <Link href="/privacy" className="hover:text-ink transition-colors font-semibold text-ink">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-ink transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
