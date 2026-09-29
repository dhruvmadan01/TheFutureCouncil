"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Check,
  Search,
  ArrowRight,
  Handshake,
  Heart,
  Send,
} from "lucide-react";

export default function StyleguidePage() {
  const [connectNote, setConnectNote] = useState(
    "Hey Ananya! I'm building a direct-to-mandi marketplace for farmers in Haryana. Loved MandiRates. Would you be up for a 20-min call this week?"
  );

  return (
    <div className="min-h-screen bg-warm text-ink pb-24">
      {/* Top Brand Bar */}
      <header className="border-b border-line bg-card/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="TFC Logo"
              width={28}
              height={28}
              className="rounded-[6px] shadow-xs"
            />
            <div className="flex items-baseline gap-2">
              <span className="font-display text-xl font-extrabold tracking-tight text-ink">
                TFC Connect
              </span>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-orange-deep bg-orange-soft px-2 py-0.5 rounded-full">
                Styleguide · PDF p5
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-mono uppercase tracking-wider text-ink-soft hover:text-ink transition-colors"
            >
              ← Portal Home
            </Link>
            <Button size="sm" variant="solid">
              Connect
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1180px] mx-auto px-4 sm:px-8 pt-8 space-y-12">
        {/* Page Hero matching PDF Page 5 Header */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="glow-dot" />
            <span className="eyebrow">02 · DESIGN SYSTEM</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-ink tracking-tight leading-[1.05]">
            Look & feel: the Builder World from{" "}
            <span className="text-orange">thefuturecouncil.in</span>
          </h1>
          <p className="font-sans text-ink-soft text-base sm:text-lg max-w-3xl leading-relaxed">
            TFC Connect lives inside the site&apos;s &ldquo;Builder World&rdquo;,
            with its warm cream, night ink, TFC orange and forest green. It
            reuses the same fonts, pill buttons and recurring objects, so moving
            from the main site into the portal feels like one product.
          </p>
        </section>

        {/* 1. Colour Tokens (from tfc-theme.css) */}
        <section className="space-y-6">
          <div className="border-b border-line pb-2 flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-ink">
              1. Colour Tokens (from tfc-theme.css)
            </h2>
            <span className="font-mono text-xs text-mute">CSS Variables & Theme</span>
          </div>

          {/* Primary Swatches */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            <div className="bg-card border border-line rounded-2xl p-4 shadow-card flex flex-col justify-between h-32">
              <div className="w-full h-12 rounded-xl bg-orange shadow-inner" />
              <div>
                <p className="font-display font-bold text-sm text-ink">Orange</p>
                <p className="font-mono text-xs text-mute">#E2542A · --color-orange</p>
              </div>
            </div>

            <div className="bg-card border border-line rounded-2xl p-4 shadow-card flex flex-col justify-between h-32">
              <div className="w-full h-12 rounded-xl bg-orange-deep shadow-inner" />
              <div>
                <p className="font-display font-bold text-sm text-ink">Orange deep</p>
                <p className="font-mono text-xs text-mute">#AE3D18 · --color-orange-deep</p>
              </div>
            </div>

            <div className="bg-card border border-line rounded-2xl p-4 shadow-card flex flex-col justify-between h-32">
              <div className="w-full h-12 rounded-xl bg-ink shadow-inner" />
              <div>
                <p className="font-display font-bold text-sm text-ink">Ink</p>
                <p className="font-mono text-xs text-mute">#1B1712 · --color-ink</p>
              </div>
            </div>

            <div className="bg-card border border-line rounded-2xl p-4 shadow-card flex flex-col justify-between h-32">
              <div className="w-full h-12 rounded-xl bg-warm border border-line shadow-inner" />
              <div>
                <p className="font-display font-bold text-sm text-ink">Warm (Cream)</p>
                <p className="font-mono text-xs text-mute">#FFF4E8 · --color-warm</p>
              </div>
            </div>

            <div className="bg-card border border-line rounded-2xl p-4 shadow-card flex flex-col justify-between h-32">
              <div className="w-full h-12 rounded-xl bg-forest shadow-inner" />
              <div>
                <p className="font-display font-bold text-sm text-ink">Forest</p>
                <p className="font-mono text-xs text-mute">#1F5A45 · --color-forest</p>
              </div>
            </div>
          </div>

          {/* Secondary Swatches & Tints */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            <div className="bg-card border border-line rounded-xl p-3 shadow-xs">
              <div className="w-full h-8 rounded-lg bg-warm-2 mb-2 border border-line/60" />
              <p className="font-sans font-semibold text-xs text-ink">Warm-2</p>
              <p className="font-mono text-[11px] text-mute">#FBE6D4</p>
            </div>
            <div className="bg-card border border-line rounded-xl p-3 shadow-xs">
              <div className="w-full h-8 rounded-lg bg-line mb-2" />
              <p className="font-sans font-semibold text-xs text-ink">Line</p>
              <p className="font-mono text-[11px] text-mute">#EAD7C6</p>
            </div>
            <div className="bg-card border border-line rounded-xl p-3 shadow-xs">
              <div className="w-full h-8 rounded-lg bg-ink-soft mb-2" />
              <p className="font-sans font-semibold text-xs text-ink">Ink-soft</p>
              <p className="font-mono text-[11px] text-mute">#5A4E44</p>
            </div>
            <div className="bg-card border border-line rounded-xl p-3 shadow-xs">
              <div className="w-full h-8 rounded-lg bg-mute mb-2" />
              <p className="font-sans font-semibold text-xs text-ink">Mute</p>
              <p className="font-mono text-[11px] text-mute">#8C7D70</p>
            </div>
            <div className="bg-card border border-line rounded-xl p-3 shadow-xs">
              <div className="w-full h-8 rounded-lg bg-ballpoint mb-2" />
              <p className="font-sans font-semibold text-xs text-ink">Ballpoint</p>
              <p className="font-mono text-[11px] text-mute">#2C4A9A</p>
            </div>
            <div className="bg-card border border-line rounded-xl p-3 shadow-xs">
              <div className="w-full h-8 rounded-lg bg-forest-soft mb-2 border border-forest/20" />
              <p className="font-sans font-semibold text-xs text-ink">Forest-soft</p>
              <p className="font-mono text-[11px] text-mute">#E8F1ED</p>
            </div>
          </div>
        </section>

        {/* 2. Status Chips (always the same meaning) */}
        <section className="space-y-4">
          <div className="border-b border-line pb-2 flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-ink">
              2. Status Chips (always the same meaning)
            </h2>
            <span className="font-mono text-xs text-mute">Pill Badges</span>
          </div>

          <div className="bg-card border border-line rounded-2xl p-6 shadow-card space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Chip variant="verified">
                <Check className="size-3 stroke-[2.5]" />
                Verified
              </Chip>
              <Chip variant="backed">
                <span className="glow-dot size-2" />
                TFC Backed
              </Chip>
              <Chip variant="hiring">Hiring</Chip>
              <Chip variant="raising">Raising</Chip>
              <Chip variant="needs">Needs co-founder</Chip>
              <Chip variant="neutral">Open to join</Chip>
            </div>

            <p className="font-mono text-xs text-mute pt-2 border-t border-line/60">
              Rules: Status chips always mean the same thing: Verified = forest,
              TFC Backed = orange, Hiring = ballpoint, Raising = amber, Needs
              co-founder = plum. Chips always carry text, never colour alone.
            </p>
          </div>
        </section>

        {/* 3. Typography */}
        <section className="space-y-4">
          <div className="border-b border-line pb-2 flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-ink">
              3. Typography
            </h2>
            <span className="font-mono text-xs text-mute">3 Google Fonts</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Display */}
            <div className="bg-card border border-line rounded-2xl p-6 shadow-card space-y-3">
              <span className="font-mono text-[11px] uppercase tracking-wider text-orange-deep font-semibold">
                Headlines · Bricolage Grotesque 800
              </span>
              <p className="font-display text-4xl font-extrabold text-ink tracking-tight leading-[1.05]">
                Don&apos;t queue. Build.
              </p>
              <p className="font-sans text-xs text-ink-soft">
                Class: <code className="font-mono font-medium">font-display</code> (400, 600, 800), tracking -0.02em, line-height 1.05.
              </p>
            </div>

            {/* Sans */}
            <div className="bg-card border border-line rounded-2xl p-6 shadow-card space-y-3">
              <span className="font-mono text-[11px] uppercase tracking-wider text-orange-deep font-semibold">
                UI & Body · Instrument Sans
              </span>
              <p className="font-sans text-lg font-medium text-ink leading-snug">
                Instrument Sans for body, buttons and UI text.
              </p>
              <p className="font-sans text-sm text-ink-soft">
                Weights 400, 500, 600. Clean, humanist readability built for product clarity.
              </p>
            </div>

            {/* Mono */}
            <div className="bg-card border border-line rounded-2xl p-6 shadow-card space-y-3">
              <span className="font-mono text-[11px] uppercase tracking-wider text-orange-deep font-semibold">
                Labels & Stamps · IBM Plex Mono
              </span>
              <div className="flex items-center gap-2">
                <span className="glow-dot" />
                <span className="eyebrow">LABELS, STAMPS, METADATA</span>
              </div>
              <p className="font-mono text-xs text-ink-soft tracking-wider">
                Weights 500/600 · uppercase, tracked 0.08–0.1em.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Shape and Components (Buttons, Inputs, Cards) */}
        <section className="space-y-6">
          <div className="border-b border-line pb-2 flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-ink">
              4. Shape & Components
            </h2>
            <span className="font-mono text-xs text-mute">Pill Buttons, Inputs, Cards</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pill Buttons Card */}
            <Card>
              <CardHeader>
                <CardTitle>Pill Buttons (rounded-full)</CardTitle>
                <CardDescription>
                  Variants: solid (orange), dark (ink), forest (teamed up), and ghost (white + border).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="solid">
                    Connect
                    <ArrowRight className="size-4" />
                  </Button>
                  <Button variant="dark">Join a chapter</Button>
                  <Button variant="forest">
                    <Handshake className="size-4" />
                    We teamed up
                  </Button>
                  <Button variant="ghost">Save</Button>
                </div>

                <div className="space-y-2 pt-3 border-t border-line/60">
                  <p className="font-mono text-xs text-mute">Sizes:</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm" variant="solid">Small (36px)</Button>
                    <Button size="default" variant="solid">Default (44px tap)</Button>
                    <Button size="lg" variant="solid">Large (48px)</Button>
                    <Button size="icon" variant="ghost" aria-label="Heart">
                      <Heart className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inputs & Search Card */}
            <Card>
              <CardHeader>
                <CardTitle>Inputs & Search</CardTitle>
                <CardDescription>
                  White background, 1px line border, rounded-xl. Search fields are rounded pills.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-mute pointer-events-none" />
                  <Input
                    variant="pill"
                    placeholder="Search founders, skills, colleges…"
                    className="pl-11"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-xs uppercase tracking-wider text-ink-soft">
                    Standard Field (rounded-xl)
                  </label>
                  <Input placeholder="e.g. rohan@du.ac.in" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cards & Previews (from Page 5 of PDF) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Person Card Preview */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex-row items-center gap-4 pb-3">
                <div className="size-12 rounded-full bg-forest text-white font-display font-bold flex items-center justify-center text-base shrink-0 shadow-inner">
                  AK
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-lg text-ink">
                      Ananya K.
                    </span>
                    <span className="size-4 rounded-full bg-forest text-white flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  </div>
                  <p className="font-sans text-xs text-ink-soft">
                    IIT Madras · Chennai
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-display font-extrabold text-xl text-orange">
                    92
                  </span>
                  <p className="font-mono text-[10px] text-mute uppercase">Match</p>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Why you match box */}
                <div className="bg-orange-soft border border-orange/20 rounded-xl p-3">
                  <p className="font-sans text-xs font-medium text-orange-deep leading-relaxed">
                    <strong>Why you match:</strong> you need a developer, and she has shipped 3 apps. Both full-time from Jan.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <Chip variant="neutral">Tech</Chip>
                  <Chip variant="neutral">React</Chip>
                  <Chip variant="neutral">ML</Chip>
                  <Chip variant="verified">SIH Finalist</Chip>
                </div>
              </CardContent>

              <CardFooter className="justify-between">
                <Button size="sm" variant="solid">
                  Connect
                </Button>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost">
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" className="text-mute">
                    ✕
                  </Button>
                </div>
              </CardFooter>
            </Card>

            {/* Startup Card Preview */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex-row items-center gap-4 pb-3">
                <div className="size-12 rounded-2xl bg-amber-soft border border-amber/30 text-amber font-display font-extrabold flex items-center justify-center text-xl shrink-0">
                  K
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-lg text-ink">
                      KisanLink
                    </span>
                    <span className="size-4 rounded-full bg-forest text-white flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  </div>
                  <p className="font-sans text-xs text-ink-soft truncate">
                    Market access for farmers
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-display font-extrabold text-sm text-ink-soft">
                    ♥ 214
                  </span>
                  <p className="font-mono text-[10px] text-mute uppercase">Followers</p>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="font-sans text-xs text-ink leading-relaxed">
                  Sell crops direct to mandis with zero middlemen. 40+ farmer groups active in Haryana.
                </p>

                <div className="flex flex-wrap items-center gap-1.5">
                  <Chip variant="neutral">🚀 Launched</Chip>
                  <Chip variant="backed">
                    <span className="glow-dot size-1.5" />
                    TFC Backed
                  </Chip>
                  <Chip variant="needs">Needs co-founder</Chip>
                  <Chip variant="hiring">Hiring</Chip>
                </div>
              </CardContent>

              <CardFooter className="justify-between">
                <span className="font-mono text-xs text-ink-soft">
                  AgriTech · Delhi NCR
                </span>
                <Button size="sm" variant="dark">
                  View Startup ↗
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* 5. Borrowed Objects: Dashed Path & Night Sky */}
        <section className="space-y-6">
          <div className="border-b border-line pb-2 flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-ink">
              5. Borrowed Objects (from thefuturecouncil.in)
            </h2>
            <span className="font-mono text-xs text-mute">Recurring Motifs</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Object 1: The Dashed Path */}
            <div className="bg-card border border-line rounded-2xl p-6 shadow-card space-y-4">
              <div>
                <p className="font-display font-bold text-lg text-ink">
                  Borrowed object: the dashed path
                </p>
                <p className="font-sans text-xs text-ink-soft">
                  Used for onboarding steps and the &ldquo;Talk → Test → Team up&rdquo; journey.
                </p>
              </div>

              {/* Dashed connector visualization */}
              <div className="relative py-4">
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex flex-col items-center gap-2">
                    <div className="size-10 rounded-full bg-orange text-white font-display font-extrabold flex items-center justify-center text-sm shadow-md ring-4 ring-orange-soft">
                      1
                    </div>
                    <span className="font-display font-bold text-xs text-ink">
                      Build profile
                    </span>
                  </div>

                  <div className="flex-1 mx-2 border-t-2 border-dashed border-orange" />

                  <div className="flex flex-col items-center gap-2">
                    <div className="size-10 rounded-full bg-orange text-white font-display font-extrabold flex items-center justify-center text-sm shadow-md ring-4 ring-orange-soft">
                      2
                    </div>
                    <span className="font-display font-bold text-xs text-ink">
                      Get 5 matches
                    </span>
                  </div>

                  <div className="flex-1 mx-2 border-t-2 border-dashed border-orange" />

                  <div className="flex flex-col items-center gap-2">
                    <div className="size-10 rounded-full bg-orange text-white font-display font-extrabold flex items-center justify-center text-sm shadow-md ring-4 ring-orange-soft">
                      3
                    </div>
                    <span className="font-display font-bold text-xs text-ink">
                      Team up
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Object 2: The Night Sky */}
            <div className="bg-ink text-warm rounded-2xl p-6 shadow-card space-y-4 border border-ink">
              <div>
                <p className="font-display font-bold text-lg text-warm">
                  Borrowed object: the night sky
                </p>
                <p className="font-sans text-xs text-warm/70">
                  Chapter colleges as glowing chips for social proof.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border border-[#4A3F35] bg-[#2A231C] text-warm">
                  <span className="glow-dot size-1.5" />
                  DU
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border border-[#4A3F35] bg-[#2A231C] text-warm">
                  <span className="glow-dot size-1.5" />
                  NSUT
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border border-[#4A3F35] bg-[#2A231C] text-warm">
                  <span className="glow-dot size-1.5" />
                  DTU
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border border-[#4A3F35] bg-[#2A231C] text-warm">
                  <span className="glow-dot size-1.5" />
                  IIT Madras BS
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border border-[#4A3F35] bg-[#2A231C] text-warm">
                  <span className="glow-dot size-1.5" />
                  SRCC
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border border-[#4A3F35] bg-[#2A231C] text-warm">
                  <span className="glow-dot size-1.5" />
                  + 85 chapters
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Interactive Dialog & Sheet Modals */}
        <section className="space-y-4">
          <div className="border-b border-line pb-2 flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-ink">
              6. Dialog & Sheet (Restyled Primitives)
            </h2>
            <span className="font-mono text-xs text-mute">Desktop Dialog & Mobile Sheet</span>
          </div>

          <div className="bg-card border border-line rounded-2xl p-6 shadow-card flex flex-wrap items-center gap-4">
            {/* Dialog Trigger */}
            <Dialog>
              <DialogTrigger render={<Button variant="solid" />}>
                Open Desktop Connect Dialog
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <span className="glow-dot" />
                    <span className="eyebrow">CO-FOUNDER CONNECT</span>
                  </div>
                  <DialogTitle>Send a note to Ananya</DialogTitle>
                  <DialogDescription>
                    A good note triples your acceptance rate. Minimum 50 characters.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                  <textarea
                    rows={4}
                    value={connectNote}
                    onChange={(e) => setConnectNote(e.target.value)}
                    className="w-full bg-warm/50 border border-line rounded-xl p-3 text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-3 focus:ring-orange/40 focus:border-orange font-sans resize-none"
                    placeholder="Say what you're building, why them, and a clear ask..."
                  />
                  <div className="flex items-center justify-between text-xs font-mono text-mute">
                    <span>💡 Tips: say what you&apos;re building & clear ask</span>
                    <span className={connectNote.length < 50 ? "text-plum font-semibold" : "text-forest font-semibold"}>
                      {connectNote.length} / 500
                    </span>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="solid" className="w-full sm:w-auto">
                    <Send className="size-4" />
                    Send request (7 left this week)
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Mobile Sheet Trigger */}
            <Sheet>
              <SheetTrigger render={<Button variant="dark" />}>
                Open Bottom Connect Sheet (Mobile Form)
              </SheetTrigger>
              <SheetContent side="bottom">
                <SheetHeader>
                  <div className="flex items-center gap-2">
                    <span className="glow-dot" />
                    <span className="eyebrow">MOBILE SHEET · 390PX READY</span>
                  </div>
                  <SheetTitle>Send request with intent</SheetTitle>
                  <SheetDescription>
                    Requests require a thoughtful note to kill spam.
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-3 py-2">
                  <textarea
                    rows={3}
                    defaultValue="Hey Ananya! Loved MandiRates. Would you be up for a 20-min call this week?"
                    className="w-full bg-warm/50 border border-line rounded-xl p-3 text-sm text-ink focus:outline-none focus:ring-3 focus:ring-orange/40 font-sans resize-none"
                  />
                  <div className="bg-orange-soft border border-orange/20 rounded-xl p-2.5 text-xs text-orange-deep font-sans">
                    <strong>Notice:</strong> Contact details (email & LinkedIn) remain hidden until both of you accept.
                  </div>
                </div>

                <SheetFooter>
                  <Button variant="solid" className="w-full">
                    Confirm & Send Note
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </section>

        {/* 7. Design Principles & Tone of Voice */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-line rounded-2xl p-6 shadow-card space-y-2">
            <span className="eyebrow">TONE OF VOICE</span>
            <p className="font-display font-bold text-lg text-ink">
              Student-to-student, short and punchy
            </p>
            <p className="font-sans text-sm text-ink-soft leading-relaxed">
              &ldquo;Don&apos;t build alone.&rdquo; &bull; &ldquo;Someone on your campus is looking for you.&rdquo; &bull; &ldquo;Proof beats a CV.&rdquo;
            </p>
          </div>

          <div className="bg-card border border-line rounded-2xl p-6 shadow-card space-y-2">
            <span className="eyebrow">EMPTY STATES & ACCESS</span>
            <p className="font-display font-bold text-lg text-ink">
              Never a blank screen · 44px tap targets
            </p>
            <p className="font-sans text-sm text-ink-soft leading-relaxed">
              Always show the next action. Minimum 4.5:1 contrast ratio. Mobile-first design for 390px screens.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
