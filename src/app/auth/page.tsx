"use client";

import { useState, FormEvent } from "react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/* ─── Constants ─── */
const ease = [0.25, 0.46, 0.45, 0.94] as const;

/* ─── Page ─── */
export default function AuthPage() {
    const [mode, setMode] = useState<"signin" | "signup">("signin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    const supabase = createClient();
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (!supabase) {
            setMessage({
                type: "error",
                text: "Supabase is not configured. Add your credentials to .env.local and restart the dev server.",
            });
            setLoading(false);
            return;
        }

        if (mode === "signup") {
            const { data, error } = await supabase.auth.signUp({ email, password })

            if (!error && data.user) {
                // Save name to profiles table
                await supabase.from('profiles').upsert({
                    id: data.user.id,
                    full_name: fullName.trim() || email.split('@')[0],
                    updated_at: new Date().toISOString(),
                })
            }

            if (error) {
                setMessage({ type: "error", text: error.message });
                setLoading(false);
            } else {
                // Immediately sign in after sign up since email confirmation is disabled
                const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
                if (!signInError) {
                    router.push('/habits')
                    router.refresh()
                } else {
                    setMessage({ type: "error", text: 'Account created! Please sign in.' });
                    setLoading(false);
                }
            }
        } else {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) {
                setMessage({ type: "error", text: error.message });
                setLoading(false);
            } else {
                router.push('/habits')
                router.refresh()
            }
        }
    };

    const isSignUp = mode === "signup";

    return (
        <div className="min-h-screen bg-[#0A0A0F] flex">
            {/* ═══════════════ BACK LINK — FIXED ═══════════════ */}
            <Link
                href="/"
                className="fixed top-6 left-6 z-50 flex items-center gap-2 group"
            >
                <span className="text-[#6B6B8A] text-xs">←</span>
                <span className="font-display font-bold text-sm text-white tracking-widest">
                    SINGULARITY
                </span>
            </Link>

            {/* ═══════════════ LEFT PANEL — FORM ═══════════════ */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 sm:p-10 lg:p-16 relative">

                {/* Center — Form */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease, delay: 0.1 }}
                    className="max-w-sm mx-auto w-full"
                >
                    {/* Toggle Pill */}
                    <div className="flex items-center rounded-full bg-[#111118] border border-white/[0.06] p-1 mb-10">
                        <button
                            type="button"
                            onClick={() => {
                                setMode("signin");
                                setMessage(null);
                            }}
                            className={`flex-1 py-2.5 text-sm font-body font-medium rounded-full transition-all duration-300
                ${!isSignUp
                                    ? "bg-[#7C3AED] text-white shadow-lg shadow-purple-900/30"
                                    : "text-[#6B6B8A] hover:text-white"
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setMode("signup");
                                setMessage(null);
                            }}
                            className={`flex-1 py-2.5 text-sm font-body font-medium rounded-full transition-all duration-300
                ${isSignUp
                                    ? "bg-[#7C3AED] text-white shadow-lg shadow-purple-900/30"
                                    : "text-[#6B6B8A] hover:text-white"
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Heading */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease }}
                        >
                            <h1 className="font-display font-bold text-white text-[32px] sm:text-[36px] leading-tight">
                                {isSignUp ? "Start your journey" : "Welcome back"}
                            </h1>
                            <p className="font-body text-[#6B6B8A] text-sm mt-2 leading-relaxed">
                                {isSignUp
                                    ? "Create an account to track habits, journal, and grow."
                                    : "Sign in to pick up where you left off."}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        {/* Full Name — sign up only */}
                        {mode === 'signup' && (
                            <div className="mb-4">
                                <label className="text-[#6B6B8A] text-xs uppercase tracking-widest mb-1.5 block" style={{ fontFamily: 'Satoshi' }}>
                                    YOUR NAME
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    placeholder="What should we call you?"
                                    className="w-full bg-[#0A0A0F] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
                                    style={{ fontFamily: 'Satoshi' }}
                                />
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block font-body text-xs text-[#6B6B8A] uppercase tracking-wider mb-2"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full px-4 py-3 rounded-lg bg-[#111118] border border-white/[0.06]
                           text-white font-body text-sm placeholder:text-[#3D3D54]
                           focus:outline-none focus:border-[#7C3AED]/50 focus:ring-1 focus:ring-[#7C3AED]/30
                           transition-all duration-200"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label
                                    htmlFor="password"
                                    className="font-body text-xs text-[#6B6B8A] uppercase tracking-wider"
                                >
                                    Password
                                </label>
                                {mode === "signin" && (
                                    <Link
                                        href="/auth/forgot-password"
                                        className="text-xs text-purple-400 hover:text-purple-300 transition-colors font-body"
                                    >
                                        Forgot password?
                                    </Link>
                                )}
                            </div>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={isSignUp ? "Min. 6 characters" : "••••••••"}
                                required
                                minLength={6}
                                className="w-full px-4 py-3 rounded-lg bg-[#111118] border border-white/[0.06]
                           text-white font-body text-sm placeholder:text-[#3D3D54]
                           focus:outline-none focus:border-[#7C3AED]/50 focus:ring-1 focus:ring-[#7C3AED]/30
                           transition-all duration-200"
                            />
                        </div>

                        {/* Message */}
                        <AnimatePresence>
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    transition={{ duration: 0.2 }}
                                    className={`flex items-start gap-2 rounded-lg px-4 py-3 text-sm font-body ${message.type === "error"
                                        ? "bg-red-500/10 border border-red-500/20 text-red-400"
                                        : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                        }`}
                                >
                                    <span className="mt-0.5 shrink-0">
                                        {message.type === "error" ? "✕" : "✓"}
                                    </span>
                                    <span>{message.text}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit */}
                        <button
                            id="auth-submit"
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 text-sm font-body font-medium text-white bg-[#7C3AED] rounded-lg
                         hover:bg-[#A855F7] transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed
                         relative overflow-hidden group"
                        >
                            <span
                                className={`inline-flex items-center gap-2 transition-opacity ${loading ? "opacity-0" : "opacity-100"
                                    }`}
                            >
                                {isSignUp ? "Create Account" : "Sign In"}
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                >
                                    <path
                                        d="M3 8h10m0 0L9 4m4 4L9 12"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </span>
                            {loading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                </div>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-white/[0.06]" />
                        <span className="font-body text-xs text-[#3D3D54] uppercase tracking-wider">
                            or
                        </span>
                        <div className="flex-1 h-px bg-white/[0.06]" />
                    </div>

                    {/* OAuth placeholder */}
                    <button
                        type="button"
                        disabled
                        className="w-full py-3 text-sm font-body font-medium text-[#6B6B8A] bg-[#111118]
                       border border-white/[0.06] rounded-lg
                       hover:border-white/10 hover:text-white transition-all duration-200
                       flex items-center justify-center gap-3
                       disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Switch prompt */}
                    <p className="text-center font-body text-sm text-[#6B6B8A] mt-6">
                        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                        <button
                            type="button"
                            onClick={() => {
                                setMode(isSignUp ? "signin" : "signup");
                                setMessage(null);
                            }}
                            className="text-[#A855F7] hover:text-white transition-colors duration-200 font-medium"
                        >
                            {isSignUp ? "Sign in" : "Sign up"}
                        </button>
                    </p>
                </motion.div>

                {/* Bottom — Legal */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, ease, delay: 0.4 }}
                    className="font-body text-xs text-[#3D3D54] text-center lg:text-left"
                >
                    By continuing you agree to Singularity&apos;s{" "}
                    <span className="text-[#6B6B8A] hover:text-white transition-colors cursor-pointer">
                        Terms
                    </span>{" "}
                    and{" "}
                    <span className="text-[#6B6B8A] hover:text-white transition-colors cursor-pointer">
                        Privacy Policy
                    </span>
                    .
                </motion.p>
            </div>

            {/* ═══════════════ RIGHT PANEL ═══════════════ */}
            <div className="hidden lg:flex flex-col justify-between bg-[#0A0A0F] border-l border-white/5 relative overflow-hidden p-12 min-h-screen lg:w-1/2">
                {/* BACKGROUND ELEMENT — Giant rotated wordmark */}
                <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                    style={{ zIndex: 0 }}
                >
                    <span
                        className="text-white font-bold whitespace-nowrap"
                        style={{
                            fontFamily: 'Clash Display',
                            fontSize: 'clamp(80px, 12vw, 140px)',
                            letterSpacing: '0.05em',
                            transform: 'rotate(-90deg)',
                            opacity: 0.03,
                            userSelect: 'none',
                        }}
                    >
                        SINGULARITY
                    </span>
                </div>

                {/* SECOND BACKGROUND ELEMENT — Subtle grid texture */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        zIndex: 0,
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px',
                    }}
                />

                {/* TOP SECTION — Brand mark */}
                <div className="relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-purple-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold" style={{ fontFamily: 'Clash Display' }}>S</span>
                        </div>
                        <span
                            className="text-white text-sm font-semibold tracking-[0.15em]"
                            style={{ fontFamily: 'Clash Display' }}
                        >
                            SINGULARITY
                        </span>
                    </div>
                </div>

                {/* MIDDLE SECTION — Editorial quote block */}
                <div className="relative z-10 flex flex-col justify-center flex-1 py-16">
                    <div
                        className="text-purple-500 mb-4 leading-none"
                        style={{ fontFamily: 'Clash Display', fontSize: '80px', lineHeight: 1, opacity: 0.4 }}
                    >
                        &quot;
                    </div>
                    <h2
                        className="text-white leading-tight mb-8"
                        style={{
                            fontFamily: 'Clash Display',
                            fontSize: 'clamp(28px, 3vw, 42px)',
                            fontWeight: 600,
                            maxWidth: '420px',
                        }}
                    >
                        The person you&apos;ll be in 5 years is built by the habits you start today.
                    </h2>
                    <div className="w-12 h-0.5 bg-purple-500 mb-6" />
                    <p
                        className="text-[#6B6B8A] text-sm"
                        style={{ fontFamily: 'Satoshi' }}
                    >
                        Singularity — Personal Growth OS
                    </p>
                </div>

                {/* BOTTOM SECTION — Stats row */}
                <div className="relative z-10">
                    <div className="flex items-center gap-0 border border-white/5 rounded-xl overflow-hidden">
                        {[
                            { value: '6', label: 'Features' },
                            { value: '100%', label: 'Free to start' },
                            { value: 'PWA', label: 'Works on phone' },
                        ].map((stat, i, arr) => (
                            <div
                                key={i}
                                className={`flex-1 px-5 py-4 text-center ${i < arr.length - 1 ? 'border-r border-white/5' : ''}`}
                            >
                                <p
                                    className="text-white font-semibold text-lg leading-none mb-1"
                                    style={{ fontFamily: 'Clash Display' }}
                                >
                                    {stat.value}
                                </p>
                                <p
                                    className="text-[#6B6B8A] text-[10px] uppercase tracking-widest"
                                    style={{ fontFamily: 'Satoshi' }}
                                >
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
