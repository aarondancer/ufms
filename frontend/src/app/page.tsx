"use client";

import { useIsAuthenticated } from "@/api";
import { useEffect } from "react";

export default function Home() {
  const hasAuth = useIsAuthenticated();

  useEffect(() => {
    if (hasAuth) {
      window.location.replace("/dashboard");
    } else {
      window.location.replace("/auth");
    }
  }, [hasAuth]);

  return null;
}
