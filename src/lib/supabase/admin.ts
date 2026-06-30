import { createClient } from "@supabase/supabase-js";

import { getProductionConfig } from "@/lib/config";
import type { Database } from "@/types/database";

export function getSupabaseAdmin() {
  const config = getProductionConfig();
  return createClient<Database>(
    config.NEXT_PUBLIC_SUPABASE_URL,
    config.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
