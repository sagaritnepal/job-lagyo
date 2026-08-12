"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import {
  fetchMyNotifications,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/actions/notifications";
import type { Notification } from "@/lib/types";

function relativeTime(dateString: string) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString("en-CA");
}

export function NotificationBell({
  initialUnreadCount,
  dark = false,
}: {
  initialUnreadCount: number;
  dark?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [pending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next && notifications === null) {
      startTransition(async () => {
        const items = await fetchMyNotifications();
        setNotifications(items);
      });
    }
  }

  function handleSelect(notification: Notification) {
    if (!notification.read) {
      setNotifications((prev) =>
        prev?.map((n) => (n.id === notification.id ? { ...n, read: true } : n)) ?? prev,
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      startTransition(() => markNotificationReadAction(notification.id));
    }
    setOpen(false);
    if (notification.link) router.push(notification.link);
  }

  function handleMarkAllRead() {
    setNotifications((prev) => prev?.map((n) => ({ ...n, read: true })) ?? prev);
    setUnreadCount(0);
    startTransition(() => markAllNotificationsReadAction());
  }

  const buttonClass = dark
    ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-700 text-neutral-400 hover:bg-neutral-800"
    : "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50";

  return (
    <div ref={containerRef} className="relative">
      <button type="button" onClick={toggleOpen} className={buttonClass} aria-label="Notifications">
        <Bell className="h-3.5 w-3.5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] rounded-lg border border-neutral-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-neutral-100 px-3.5 py-2.5">
            <p className="text-sm font-semibold text-neutral-900">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs font-semibold text-primary-700 hover:underline"
              >
                <CheckCheck className="h-3 w-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications === null ? (
              <p className="p-4 text-center text-xs text-neutral-400">
                {pending ? "Loading..." : ""}
              </p>
            ) : notifications.length === 0 ? (
              <p className="p-6 text-center text-xs text-neutral-500">No notifications yet.</p>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {notifications.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(n)}
                      className={`flex w-full items-start gap-2 px-3.5 py-2.5 text-left hover:bg-neutral-50 ${
                        n.read ? "" : "bg-primary-50/50"
                      }`}
                    >
                      <span
                        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                          n.read ? "bg-transparent" : "bg-primary-600"
                        }`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold text-neutral-900">
                          {n.title}
                        </span>
                        {n.body && (
                          <span className="mt-0.5 block truncate text-xs text-neutral-500">
                            {n.body}
                          </span>
                        )}
                        <span className="mt-0.5 block text-[11px] text-neutral-400">
                          {relativeTime(n.created_at)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
