// Import and re-export our new client from utils
import { createClient as createSupabaseClient } from '@/utils/supabase/client'

export const supabase = createSupabaseClient()

