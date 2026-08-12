"use client";

import { useEffect } from "react";

/**
 * Registers the CampusFlow service worker for offline support + PWA
 * installability. No-ops if the browser doesn't support SWs.
 */
export function RegisterSW() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* ignore registration failures (e.g. unsupported context) */
      });
    };
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);
  return null;
}
