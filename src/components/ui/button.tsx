import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover-capable:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover-capable:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover-capable:bg-accent hover-capable:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover-capable:bg-secondary/80",
        ghost: "hover-capable:bg-accent hover-capable:text-accent-foreground",
        link: "text-primary underline-offset-4 hover-capable:underline",
      },
      size: {
        default: "mouse:h-10 mouse:px-4 mouse:py-2 touch:h-14 touch:px-6 touch:py-3 touch-primary",
        sm: "mouse:h-9 mouse:px-3 touch:h-12 touch:px-5 rounded-md text-xs",
        lg: "mouse:h-10 mouse:px-8 touch:h-14 touch:px-10 rounded-md touch-primary",
        xl: "h-14 rounded-md px-8 text-lg touch:px-10 touch-primary", // Gloves-on mode - always 56px
        icon: "mouse:h-10 mouse:w-10 touch:h-14 touch:w-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
