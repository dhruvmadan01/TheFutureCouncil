import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  variant?: "default" | "pill";
}

function Input({ className, type, variant = "default", ...props }: InputProps) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 bg-card border border-line px-3.5 py-2 text-sm text-ink placeholder:text-mute transition-all outline-none",
        "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-orange/40 focus-visible:border-orange",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        variant === "pill" ? "rounded-full px-4" : "rounded-xl",
        className
      )}
      {...props}
    />
  );
}

export { Input };
