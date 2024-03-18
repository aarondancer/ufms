"use client";

import { logout } from "@/api";
import { useEffect } from "react";

export default function Logout() {
  useEffect(() => {
    logout();
  }, []);

  return null;
}
