import { createClient } from '@supabase/supabase-js';

// Server-side only client using service role key (bypasses RLS)
// Never expose SUPABASE_SERVICE_ROLE_KEY to the browser
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
