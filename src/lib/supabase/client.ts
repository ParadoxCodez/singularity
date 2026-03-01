import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    // Validate before creating — avoid crash on placeholder values
    if (
        !supabaseUrl ||
        supabaseUrl === 'your_supabase_url_here' ||
        !supabaseUrl.startsWith('http')
    ) {
        return null
    }

    return createBrowserClient(supabaseUrl, supabaseKey)
}
