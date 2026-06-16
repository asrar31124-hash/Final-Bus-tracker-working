import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

// TanStack Start server-side setup - adapt cookies handling as needed
export const createClient = (cookieStore?: any) => {
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: cookieStore ? {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Ignore if setAll called from Server Component without cookie access
          }
        },
      } : {},
    },
  );
};
