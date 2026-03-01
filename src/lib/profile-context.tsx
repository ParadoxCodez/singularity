'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Profile {
    id: string
    full_name: string | null
    avatar_url: string | null
    preferences: { currency: string } | null
}

interface ProfileContextType {
    profile: Profile | null
    loading: boolean
    refreshProfile: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextType>({
    profile: null,
    loading: true,
    refreshProfile: async () => { },
})

export function ProfileProvider({ children }: { children: React.ReactNode }) {
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchProfile = useCallback(async () => {
        try {
            const supabase = createClient()
            if (!supabase) { setLoading(false); return }
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            if (authError || !user) { setLoading(false); return }

            const { data } = await supabase
                .from('profiles')
                .select('full_name, avatar_url, preferences')
                .eq('id', user.id)
                .single()

            // If no profile row exists yet
            if (!data) {
                setProfile({
                    id: user.id,
                    full_name: null,
                    avatar_url: null,
                    preferences: null,
                })
            } else {
                setProfile({ id: user.id, ...data })
            }
        } catch (e) {
            console.error('Profile fetch error:', e)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchProfile()
    }, [fetchProfile])

    return (
        <ProfileContext.Provider value={{ profile, loading, refreshProfile: fetchProfile }}>
            {children}
        </ProfileContext.Provider>
    )
}

export const useProfile = () => useContext(ProfileContext)
