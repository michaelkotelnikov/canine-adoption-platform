import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "rounded-md bg-primary text-primary-foreground shadow hover:bg-primary/90 text-sm",
        destructive:
          "rounded-md bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 text-sm",
        outline:
          "rounded-md border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground text-sm",
        secondary:
          "rounded-md bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 text-sm",
        ghost: "rounded-md hover:bg-accent hover:text-accent-foreground text-sm",
        link: "text-primary underline-offset-4 hover:underline text-sm",
        shelter:
          "min-h-11 rounded-full bg-primary px-8 py-2.5 text-base text-primary-foreground shadow-shelter transition-transform hover:bg-brand-alt hover:scale-[1.02] active:scale-[0.99]",
        shelterSecondary:
          "min-h-11 rounded-full border border-border bg-secondary px-6 py-2.5 text-base text-secondary-foreground hover:bg-muted",
      },
      size: {
        default: "h-9 px-4 py-2 text-sm rounded-md",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8 text-sm",
        icon: "h-9 w-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
