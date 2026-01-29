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
        default: "h-10 px-4 py-2 pointer-coarse:h-14 pointer-coarse:px-6 pointer-coarse:py-3 touch-primary",
        sm: "h-9 px-3 rounded-md text-xs pointer-coarse:h-12 pointer-coarse:px-5",
        lg: "h-11 px-8 rounded-md pointer-coarse:h-14 pointer-coarse:px-10 touch-primary",
        xl: "h-14 rounded-md px-8 text-lg pointer-coarse:h-14 pointer-coarse:px-10 touch-primary", // Gloves-on mode
        icon: "h-10 w-10 pointer-coarse:h-14 pointer-coarse:w-14",
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
