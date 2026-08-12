import { createClient } from "@/lib/supabase/server";
import type { Notification } from "@/lib/types";

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) {
    console.error("getUnreadNotificationCount error:", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function getRecentNotifications(
  userId: string,
  limit = 15,
): Promise<Notification[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getRecentNotifications error:", error.message);
    return [];
  }
  return (data as Notification[]) ?? [];
}
