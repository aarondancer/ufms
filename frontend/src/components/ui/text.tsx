import { cn } from "@/utils";
import React from "react";

export const H1 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h1
    ref={ref}
    className={cn("text-3xl font-bold leading-tight text-primary", className)}
    {...props}
  />
));

H1.displayName = "H1";
