import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// auth.getUser() makes a real network round-trip to Supabase Auth to verify
// the JWT. Layouts and pages each used to call it independently, so a single
// page load could fire it 2-3x. React's cache() memoizes it per request so
// every Server Component on the same render reuses one result.
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
