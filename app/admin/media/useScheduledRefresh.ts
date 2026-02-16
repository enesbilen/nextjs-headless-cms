"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const REFRESH_DEBOUNCE_MS = 500;

/**
 * Returns a debounced refresh: multiple calls within 500ms result in a single router.refresh().
 * Use after mutations (delete, edit, upload, etc.) to batch rapid changes and avoid flicker.
 */
export function useScheduledRefresh() {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const requestRefresh = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      router.refresh();
      timeoutRef.current = null;
    }, REFRESH_DEBOUNCE_MS);
  }, [router]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { requestRefresh };
}
