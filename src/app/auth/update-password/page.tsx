'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [sessionReady, setSessionReady] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const supabase = createClient()
        if (!supabase) return;
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY' || session) {
                setSessionReady(true)
            }
        })
        // Also check if session already exists
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) setSessionReady(true)
        })
        return () => subscription.unsubscribe()
    }, [])

    async function handleUpdate() {
        if (password !== confirm) { setError('Passwords do not match'); return }
        if (password.length < 8) { setError('Password must be at least 8 characters'); return }
        setLoading(true)
        setError(null)
        const supabase = createClient()
        if (!supabase) {
            setError('Supabase client is not configured')
            setLoading(false)
            return
        }
        const { error } = await supabase.auth.updateUser({ password })
        if (error) { setError(error.message); setLoading(false); return }
        router.push('/habits')
    }

    if (!sessionReady) {
        return (
            <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[#6B6B8A] text-sm" style={{ fontFamily: 'Satoshi' }}>
                        Verifying your reset link...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="flex items-center gap-2 mb-10 justify-center">
                    <div className="w-6 h-6 rounded bg-purple-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold" style={{ fontFamily: 'Clash Display' }}>S</span>
                    </div>
                    <span className="text-white text-sm font-semibold tracking-[0.15em]" style={{ fontFamily: 'Clash Display' }}>
                        SINGULARITY
                    </span>
                </div>

                <div className="bg-[#111118] border border-white/5 rounded-2xl p-8">
                    <h1 className="text-white text-2xl font-bold mb-2" style={{ fontFamily: 'Clash Display' }}>
                        Set new password
                    </h1>
                    <p className="text-[#6B6B8A] text-sm mb-8" style={{ fontFamily: 'Satoshi' }}>
                        Choose a strong password for your account.
                    </p>

                    <label className="text-[#6B6B8A] text-xs uppercase tracking-widest mb-1.5 block">NEW PASSWORD</label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#0A0A0F] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all mb-4"
                    />

                    <label className="text-[#6B6B8A] text-xs uppercase tracking-widest mb-1.5 block">CONFIRM PASSWORD</label>
                    <input
                        type="password"
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#0A0A0F] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all mb-6"
                    />

                    {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

                    <button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors text-sm"
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </div>
        </div>
    )
}
