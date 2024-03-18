"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/feedback");
  }, [router]);

  return null;
}
