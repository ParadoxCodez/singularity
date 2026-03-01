"use client";

import { motion, AnimatePresence } from 'framer-motion';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from '@/lib/profile-context';

const NAV_LINKS = [
    { href: "/habits", label: "Habits" },
    { href: "/journal", label: "Journal" },
    { href: "/spending", label: "Spending" },
    { href: "/analytics", label: "Analytics" },
];

export default function AppNavbar() {
    const pathname = usePathname();
    const { profile } = useProfile();
    const [user, setUser] = useState<any>(null);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    useEffect(() => {
        const supabase = createClient()
        if (supabase) {
            supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
        }
    }, [])

    return (
        <header className="hidden lg:flex fixed top-0 left-0 right-0 z-50 bg-[#0A0A0F]/95 backdrop-blur-md border-b border-white/6 h-[60px] flex items-center">
            <div className="max-w-7xl mx-auto px-8 flex items-center justify-between w-full">
                {/* Left — Wordmark */}
                <Link href="/habits" className="flex items-center">
                    <span
                        className="text-white font-semibold tracking-[0.15em] text-sm"
                        style={{ fontFamily: 'Clash Display' }}
                    >
                        SINGULARITY
                    </span>
                </Link>

                {/* Center — Nav links */}
                <nav className="flex items-center gap-0">
                    {NAV_LINKS.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        const isHovered = hoveredItem === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onMouseEnter={() => setHoveredItem(item.href)}
                                onMouseLeave={() => setHoveredItem(null)}
                                className="relative px-4 py-2 text-sm transition-colors duration-150 z-10"
                                style={{ fontFamily: 'Satoshi' }}
                            >
                                {/* Hover/active background that slides */}
                                <AnimatePresence>
                                    {(isHovered || isActive) && (
                                        <motion.div
                                            layoutId="navHighlight"
                                            className={`absolute inset-0 rounded-md ${isActive
                                                ? 'bg-purple-500/15 border border-purple-500/20'
                                                : 'bg-white/5 border border-white/8'
                                                }`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 400,
                                                damping: 30,
                                            }}
                                        />
                                    )}
                                </AnimatePresence>
                                {/* Link text */}
                                <span className={`relative z-10 transition-colors duration-150 ${isActive
                                    ? 'text-white font-medium'
                                    : isHovered
                                        ? 'text-white'
                                        : 'text-[#6B6B8A]'
                                    }`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Right — Settings + Avatar */}
                {/* Right — Settings + Avatar */}
                <div className="flex items-center gap-3">
                    {/* Settings icon */}
                    <Link
                        href="/settings"
                        onMouseEnter={() => setHoveredItem('/settings')}
                        onMouseLeave={() => setHoveredItem(null)}
                        className="relative p-2 rounded-md transition-colors"
                    >
                        {(hoveredItem === '/settings' || pathname.startsWith('/settings')) && (
                            <motion.div
                                layoutId="navHighlight"
                                className="absolute inset-0 rounded-md bg-white/5 border border-white/8"
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                        )}
                        <svg
                            className={`relative z-10 w-4 h-4 transition-colors ${pathname.startsWith('/settings') ? 'text-white' : 'text-[#6B6B8A]'}`}
                            viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="3" />
                            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                        </svg>
                    </Link>

                    {/* Divider */}
                    <div className="w-px h-5 bg-white/10" />

                    {/* Name + Avatar */}
                    <div className="flex items-center gap-2.5 cursor-pointer group">
                        <span className="text-[#6B6B8A] text-sm group-hover:text-white transition-colors hidden sm:block" style={{ fontFamily: 'Satoshi' }}>
                            {profile?.full_name || 'My Account'}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
