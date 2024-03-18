"use client";

import { queryClient } from "@/api";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { QueryClientProvider } from "react-query";

export const Dynamic = ({
  children,
  bypass = false,
}: {
  children: React.ReactNode;
  bypass?: boolean;
}) => {
  "use client";

  const [hasMounted, setHasMounted] = useState(bypass);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>{children}</TooltipProvider>
      </QueryClientProvider>
      <Toaster />
    </>
  );
};
