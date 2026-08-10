"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { BRAND_NAVY } from "@/lib/site";

export function AppShellInit() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    import("@capacitor/status-bar").then(({ StatusBar, Style }) => {
      StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
      StatusBar.setBackgroundColor({ color: BRAND_NAVY }).catch(() => {});
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    });
  }, []);

  return null;
}
