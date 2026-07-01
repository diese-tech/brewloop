import { createClient } from "@supabase/supabase-js";

import { getSupabaseConfig } from "@/lib/config";
import type { Database } from "@/types/database";

export function getSupabaseAdmin() {
  const config = getSupabaseConfig();
  return createClient<Database>(
    config.NEXT_PUBLIC_SUPABASE_URL,
    config.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
