import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const chipVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-colors select-none font-sans",
  {
    variants: {
      variant: {
        verified: "bg-forest-soft text-forest border-forest/25",
        backed: "bg-orange-soft text-orange-deep border-orange/25 font-semibold",
        hiring: "bg-ballpoint-soft text-ballpoint border-ballpoint/25",
        raising: "bg-amber-soft text-amber border-amber/25",
        needs: "bg-plum-soft text-plum border-plum/25",
        neutral: "bg-warm-2 text-ink-soft border-line",
        default: "bg-warm-2 text-ink-soft border-line",
      },
      size: {
        default: "h-6 px-2.5 text-xs",
        sm: "h-5 px-2 text-[11px]",
        lg: "h-7 px-3 text-xs font-semibold",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "default",
    },
  }
);

export interface ChipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chipVariants> {}

function Chip({ className, variant = "neutral", size = "default", ...props }: ChipProps) {
  return (
    <div
      data-slot="chip"
      className={cn(chipVariants({ variant, size, className }))}
      {...props}
    />
  );
}

// Keep Badge as an alias for compatibility
const Badge = Chip;
const badgeVariants = chipVariants;

export { Chip, Badge, chipVariants, badgeVariants };
