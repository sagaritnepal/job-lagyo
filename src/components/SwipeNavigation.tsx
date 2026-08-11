"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const TAB_ROUTES = ["/", "/jobs", "/saved-jobs", "/my-applications", "/profile"];

const SWIPE_THRESHOLD_PX = 60;
const MAX_VERTICAL_DRIFT_PX = 50;
const EDGE_EXCLUSION_PX = 24;
const MOBILE_BREAKPOINT_PX = 768;

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

export function SwipeNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      touchStart.current = null;
      if (window.innerWidth >= MOBILE_BREAKPOINT_PX) return;
      if (TAB_ROUTES.indexOf(pathname) === -1) return;

      const target = e.target as Element;
      if (target.closest("input, textarea, select")) return;
      if (hasScrollableAncestor(target)) return;

      const touch = e.touches[0];
      if (touch.clientX < EDGE_EXCLUSION_PX || touch.clientX > window.innerWidth - EDGE_EXCLUSION_PX) {
        return;
      }
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

      const currentIndex = TAB_ROUTES.indexOf(pathname);
      if (currentIndex === -1) return;

      const nextIndex = dx < 0 ? currentIndex + 1 : currentIndex - 1;
      if (nextIndex < 0 || nextIndex >= TAB_ROUTES.length) return;

      router.push(TAB_ROUTES[nextIndex]);
    }

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [pathname, router]);

  return null;
}
