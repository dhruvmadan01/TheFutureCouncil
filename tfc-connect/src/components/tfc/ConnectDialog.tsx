"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { sendConnectionRequestAction } from "@/app/people/actions";
import { Handshake, Sparkles, Check } from "lucide-react";

interface ConnectDialogProps {
  targetId: string;
  targetName: string;
  triggerButton?: React.ReactNode;
}

export function ConnectDialog({ targetId, targetName, triggerButton }: ConnectDialogProps) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const charCount = note.length;
  const isValidLength = charCount >= 50 && charCount <= 500;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidLength) return;

    setLoading(true);
    setError(null);

    const res = await sendConnectionRequestAction(targetId, note);
    setLoading(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    setSent(true);
    setTimeout(() => {
      setOpen(false);
      setSent(false);
      setNote("");
    }, 1500);
  }

  return (
    <>
      {triggerButton ? (
        <span onClick={() => setOpen(true)} className="inline-block cursor-pointer">
          {triggerButton}
        </span>
      ) : (
        <Button variant="solid" size="sm" className="gap-2" onClick={() => setOpen(true)}>
          <Handshake className="size-4" />
          Connect
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[500px] p-6 sm:p-7">
        <DialogHeader className="space-y-1">
          <DialogTitle className="font-display text-2xl font-bold text-ink">
            Send a note to {targetName}
          </DialogTitle>
          <p className="font-sans text-xs text-ink-soft">
            A thoughtful note triples your acceptance rate. Minimum 50 characters required.
          </p>
        </DialogHeader>

        {sent ? (
          <div className="py-8 text-center space-y-3">
            <div className="size-12 rounded-full bg-forest-soft text-forest mx-auto flex items-center justify-center">
              <Check className="size-6 stroke-[2.5]" />
            </div>
            <p className="font-display font-bold text-lg text-ink">Connection request sent!</p>
            <p className="font-sans text-xs text-mute">
              When {targetName} accepts, you&apos;ll both unlock full contact info and chat.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4 pt-2">
            {error && (
              <div className="bg-plum-soft border border-plum/30 rounded-xl p-3 text-plum text-xs font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold">
                  Personal Intro Note <span className="text-orange">*</span>
                </label>
                <span
                  className={`font-mono text-[10px] ${
                    charCount < 50
                      ? "text-mute"
                      : charCount > 500
                      ? "text-plum font-bold"
                      : "text-forest font-semibold"
                  }`}
                >
                  {charCount} / 500 {charCount < 50 && `(${50 - charCount} more chars)`}
                </span>
              </div>
              <textarea
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={`Hey ${targetName.split(" ")[0]}! I'm building an AI tool for student research. Loved your projects. Would love to hop on a 15-min call to explore building together!`}
                className="w-full rounded-xl border border-line bg-white p-3 font-sans text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange"
                required
              />
            </div>

            <div className="bg-orange-soft/60 border border-orange/20 rounded-xl p-3 text-xs text-orange-deep space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <Sparkles className="size-3.5" /> Tips for a great request
              </p>
              <p className="font-sans text-[11px] leading-relaxed text-orange-deep/90">
                Say what you&apos;re building, why them specifically, and include a clear, lightweight ask (e.g. 15-min coffee or Google Meet).
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="solid"
                type="submit"
                disabled={loading || !isValidLength}
                className="gap-2"
              >
                {loading ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
      </Dialog>
    </>
  );
}
