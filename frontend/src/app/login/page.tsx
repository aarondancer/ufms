"use client";

import { useEffect } from "react";

export default function Login() {
  useEffect(() => {
    window.location.replace("/auth");
  }, []);

  return null;
}
