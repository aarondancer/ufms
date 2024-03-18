import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
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
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading,
      children,
      onClick,
      disabled,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const [isLoadingClick, setIsLoadingClick] = React.useState(false);
    const handleAsyncClick = React.useCallback(
      async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setIsLoadingClick(true);
        await onClick?.(e);
        setIsLoadingClick(false);
      },
      [onClick]
    );
    const actualLoading = loading || isLoadingClick;
    const child = actualLoading ? (
      <div className="relative w-full">
        <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center">
          <Loader2 className="animate-spin w-4 h-4 m-auto" />
        </div>
        <div className="relativ w-full opacity-0 flex items-center">
          {children}
        </div>
      </div>
    ) : (
      children
    );
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={actualLoading || disabled}
        onClick={handleAsyncClick}
        {...props}
      >
        {child}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
