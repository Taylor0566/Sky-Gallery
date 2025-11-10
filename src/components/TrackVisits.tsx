"use client";
import { useEffect } from "react";

export default function TrackVisits() {
  useEffect(() => {
    const url = "/api/track";
    try {
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        // Use sendBeacon to avoid request aborts on navigation/unload
        navigator.sendBeacon(url, "");
      } else {
        // Fallback with keepalive to reduce aborted fetch warnings
        fetch(url, { method: "POST", keepalive: true }).catch(() => {});
      }
    } catch {
      // Ignore any errors silently
    }
  }, []);
  return null;
}
