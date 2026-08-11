"use client";

import { useEffect, useRef } from "react";
import { useMobileNav } from "./MobileNavContext";

const SWIPE_THRESHOLD_PX = 60;
const MAX_VERTICAL_DRIFT_PX = 50;
const EDGE_ZONE_PX = 32;
const DESKTOP_BREAKPOINT_PX = 1024; // matches the `lg:` breakpoint the sidebar itself switches on

function hasScrollableAncestor(el: Element | null): boolean {
  while (el && el !== document.body) {
    if (el.matches("[data-no-swipe]")) return true;
    if (el.scrollWidth > el.clientWidth) {
      const overflowX = getComputedStyle(el).overflowX;
      if (overflowX === "auto" || overflowX === "scroll") return true;
    }
    el = el.parentElement;
  }
  return false;
}

export function SwipeSidebar() {
  const { open, setOpen } = useMobileNav();
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      touchStart.current = null;
      if (window.innerWidth >= DESKTOP_BREAKPOINT_PX) return;

      const touch = e.touches[0];

      if (open) {
        // Sidebar is open: any swipe (outside inputs/scrollable content) can close it.
        const target = e.target as Element;
        if (target.closest("input, textarea, select")) return;
        if (hasScrollableAncestor(target)) return;
        touchStart.current = { x: touch.clientX, y: touch.clientY };
        return;
      }

      // Sidebar is closed: only a swipe starting near the left edge opens it,
      // so it doesn't hijack normal scrolling/tapping in the middle of the page.
      if (touch.clientX > EDGE_ZONE_PX) return;
      touchStart.current = { x: touch.clientX, y: touch.clientY };
    }

    function onTouchEnd(e: TouchEvent) {
      const start = touchStart.current;
      touchStart.current = null;
      if (!start) return;

      const touch = e.changedTouches[0];
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dy) > MAX_VERTICAL_DRIFT_PX) return;

      if (dx > 0 && !open) setOpen(true);
      else if (dx < 0 && open) setOpen(false);
    }

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [open, setOpen]);

  return null;
}
