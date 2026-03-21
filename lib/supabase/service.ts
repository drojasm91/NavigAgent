import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

// Service role client — bypasses RLS. Only for server-side pipeline code.
// Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
