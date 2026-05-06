import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center px-8 py-3 text-sm font-semibold tracking-widest transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none",
          // Variantes
          variant === 'primary' && "bg-primary text-white hover:bg-opacity-90",
          variant === 'secondary' && "bg-secondary text-white hover:bg-opacity-90",
          variant === 'outline' && "border border-primary text-primary hover:bg-primary hover:text-white",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
