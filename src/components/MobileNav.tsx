"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
    { href: "/habits", label: "Habits", icon: "📋" },
    { href: "/journal", label: "Journal", icon: "🗒️" },
    { href: "/spending", label: "Spending", icon: "💸" },
    { href: "/analytics", label: "Analytics", icon: "📊" },
    { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="flex lg:hidden fixed bottom-0 left-0 right-0 bg-[#111118] border-t border-white/[0.06] z-50 h-16">
            <div className="flex items-center justify-around px-4 w-full">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 py-2 px-3 transition-colors duration-200 ${isActive ? "text-purple-400" : "text-[#6B6B8A]"
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="font-body text-[10px]">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
