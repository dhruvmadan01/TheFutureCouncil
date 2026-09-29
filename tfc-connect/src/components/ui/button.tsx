import * as React from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-full font-sans font-medium whitespace-nowrap transition-colors outline-none select-none cursor-pointer focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-orange/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 gap-2",
  {
    variants: {
      variant: {
        solid: "bg-orange text-white hover:bg-orange-deep active:scale-[0.98]",
        dark: "bg-ink text-warm hover:bg-ink/90 active:scale-[0.98]",
        forest: "bg-forest text-white hover:bg-forest/90 active:scale-[0.98]",
        ghost: "bg-card text-ink border border-line hover:bg-warm-2 active:scale-[0.98]",
        default: "bg-orange text-white hover:bg-orange-deep active:scale-[0.98]",
      },
      size: {
        default: "h-11 px-5 text-sm",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-6 text-base font-semibold",
        icon: "size-10 p-0",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "solid",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
