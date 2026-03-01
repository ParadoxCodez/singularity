'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleReset() {
        if (!email) return
        setLoading(true)
        setError(null)
        const supabase = createClient()
        if (!supabase) {
            setError('Supabase client is not configured')
            setLoading(false)
            return
        }
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/update-password`,
        })
        if (error) setError(error.message)
        else setSent(true)
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center gap-2 mb-10 justify-center">
                    <div className="w-6 h-6 rounded bg-purple-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold" style={{ fontFamily: 'Clash Display' }}>S</span>
                    </div>
                    <span className="text-white text-sm font-semibold tracking-[0.15em]" style={{ fontFamily: 'Clash Display' }}>
                        SINGULARITY
                    </span>
                </div>

                <div className="bg-[#111118] border border-white/5 rounded-2xl p-8">
                    {!sent ? (
                        <>
                            <h1 className="text-white text-2xl font-bold mb-2" style={{ fontFamily: 'Clash Display' }}>
                                Reset your password
                            </h1>
                            <p className="text-[#6B6B8A] text-sm mb-8" style={{ fontFamily: 'Satoshi' }}>
                                Enter your email and we&apos;ll send you a reset link.
                            </p>

                            <label className="text-[#6B6B8A] text-xs uppercase tracking-widest mb-1.5 block" style={{ fontFamily: 'Satoshi' }}>
                                EMAIL
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full bg-[#0A0A0F] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all mb-6"
                                style={{ fontFamily: 'Satoshi' }}
                            />

                            {error && (
                                <p className="text-red-400 text-xs mb-4" style={{ fontFamily: 'Satoshi' }}>{error}</p>
                            )}

                            <button
                                onClick={handleReset}
                                disabled={loading}
                                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors text-sm"
                                style={{ fontFamily: 'Satoshi' }}
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <div className="text-4xl mb-4">📬</div>
                            <h2 className="text-white font-semibold text-lg mb-2" style={{ fontFamily: 'Clash Display' }}>
                                Check your email
                            </h2>
                            <p className="text-[#6B6B8A] text-sm" style={{ fontFamily: 'Satoshi' }}>
                                We sent a password reset link to <span className="text-white">{email}</span>
                            </p>
                        </div>
                    )}
                </div>

                <p className="text-center mt-6 text-[#6B6B8A] text-sm" style={{ fontFamily: 'Satoshi' }}>
                    Remember your password?{' '}
                    <Link href="/auth" className="text-purple-400 hover:text-purple-300 transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}
