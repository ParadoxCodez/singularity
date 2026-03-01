"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import AddHabitModal from "@/components/AddHabitModal";
import { useProfile } from '@/lib/profile-context';

/* ─── Types ─── */
interface Habit {
    id: string;
    user_id: string;
    name: string;
    icon: string;
    is_archived: boolean;
    created_at: string;
}

interface HabitLog {
    id: string;
    habit_id: string;
    user_id: string;
    completed_date: string;
    completed: boolean;
}

/* ─── Helpers ─── */
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];
const DAYS_FULL = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

function formatToday(d: Date) {
    return `${DAYS_FULL[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

function toDateStr(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
}

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

/* ─── Options Dropdown Component ─── */
function HabitOptionsMenu({
    habitId,
    onArchive,
    onDelete,
}: {
    habitId: string;
    onArchive: (id: string) => void;
    onDelete: (id: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
                setConfirmingDelete(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    return (
        <div ref={menuRef} className="relative">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((v) => !v);
                    setConfirmingDelete(false);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-1 rounded text-[#6B6B8A] hover:text-white"
            >
                ⋮
            </button>
            {open && (
                <div className="absolute right-0 top-8 z-20 bg-[#1A1A24] border border-white/[0.08] rounded-lg py-1 min-w-[140px] shadow-xl">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onArchive(habitId);
                            setOpen(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[#6B6B8A] hover:text-white hover:bg-white/5 cursor-pointer transition-colors w-full text-left"
                    >
                        Archive habit
                    </button>
                    {confirmingDelete ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(habitId);
                                setOpen(false);
                                setConfirmingDelete(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-white/5 cursor-pointer transition-colors w-full text-left"
                        >
                            Confirm delete?
                        </button>
                    ) : (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setConfirmingDelete(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-[#6B6B8A] hover:text-red-400 hover:bg-white/5 cursor-pointer transition-colors w-full text-left"
                        >
                            Delete habit
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

/* ─── Page ─── */
export default function HabitsPage() {
    const { profile } = useProfile();
    const [user, setUser] = useState<any>(null);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [logs, setLogs] = useState<HabitLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const supabase = createClient()
        if (supabase) {
            supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
        }
    }, [])

    // Month navigation state
    const now = new Date();
    const [viewYear, setViewYear] = useState(now.getFullYear());
    const [viewMonth, setViewMonth] = useState(now.getMonth());

    const todayStr = toDateStr(now);
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);

    const supabase = createClient();

    /* ─── Fetch habits + logs ─── */
    const fetchData = useCallback(async () => {
        if (!supabase) return;
        setLoading(true);

        const { data: habitsData } = await supabase
            .from("habits")
            .select("*")
            .eq("is_archived", false)
            .order("created_at", { ascending: true });

        const startOfMonth = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-01`;
        const endOfMonth = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;

        const { data: logsData } = await supabase
            .from("habit_logs")
            .select("*")
            .gte("completed_date", startOfMonth)
            .lte("completed_date", endOfMonth);

        setHabits(habitsData || []);
        setLogs(logsData || []);
        setLoading(false);
    }, [supabase, viewYear, viewMonth, daysInMonth]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    /* ─── Helper functions ─── */
    function isCompleted(habitId: string, date: string) {
        return logs.some(
            (l) => l.habit_id === habitId && l.completed_date === date
        );
    }

    function getStreak(habitId: string) {
        let streak = 0;
        const d = new Date();
        while (true) {
            const ds = toDateStr(d);
            if (isCompleted(habitId, ds)) {
                streak++;
                d.setDate(d.getDate() - 1);
            } else {
                break;
            }
        }
        return streak;
    }

    function getMonthlyProgress(habitId: string) {
        const completed = logs.filter((l) => l.habit_id === habitId).length;
        return { completed, total: daysInMonth };
    }

    /* ─── Toggle habit ─── */
    async function toggleHabit(habitId: string, date: string) {
        if (!supabase) return;
        const completed = isCompleted(habitId, date);

        // Update state immediately — optimistic update
        if (completed) {
            setLogs((prev) =>
                prev.filter(
                    (l) => !(l.habit_id === habitId && l.completed_date === date)
                )
            );
        } else {
            setLogs((prev) => [
                ...prev,
                {
                    id: `temp-${Date.now()}`,
                    habit_id: habitId,
                    user_id: profile?.id || '',
                    completed_date: date,
                    completed: true,
                },
            ]);
        }

        // Then sync with Supabase in background
        try {
            if (completed) {
                await supabase
                    .from("habit_logs")
                    .delete()
                    .eq("habit_id", habitId)
                    .eq("completed_date", date);
            } else {
                await supabase.from("habit_logs").insert({
                    habit_id: habitId,
                    user_id: profile?.id || '',
                    completed_date: date,
                    completed: true,
                });
            }
        } catch (error) {
            // If Supabase fails, revert the optimistic update
            if (completed) {
                setLogs((prev) => [
                    ...prev,
                    {
                        id: `reverted-${Date.now()}`,
                        habit_id: habitId,
                        user_id: profile?.id || '',
                        completed_date: date,
                        completed: true,
                    },
                ]);
            } else {
                setLogs((prev) =>
                    prev.filter(
                        (l) => !(l.habit_id === habitId && l.completed_date === date)
                    )
                );
            }
        }
    }

    /* ─── Archive habit ─── */
    async function archiveHabit(habitId: string) {
        if (!supabase) return;
        await supabase
            .from('habits')
            .update({ is_archived: true })
            .eq('id', habitId);
        setHabits(prev => prev.filter(h => h.id !== habitId));
    }

    /* ─── Delete habit ─── */
    async function deleteHabit(habitId: string) {
        const supabase = createClient()
        if (!supabase) return;
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (!currentUser?.id) return

        // Delete logs first
        await supabase
            .from('habit_logs')
            .delete()
            .eq('habit_id', habitId)
            .eq('user_id', currentUser.id)

        // Then delete habit
        const { error } = await supabase
            .from('habits')
            .delete()
            .eq('id', habitId)
            .eq('user_id', currentUser.id)

        if (!error) {
            setHabits(prev => prev.filter(h => h.id !== habitId))
            setLogs(prev => prev.filter(l => l.habit_id !== habitId))
        } else {
            console.error('Delete habit error:', error.message)
        }
    }

    /* ─── Month navigation ─── */
    function prevMonth() {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear((y) => y - 1);
        } else {
            setViewMonth((m) => m - 1);
        }
    }
    function nextMonth() {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear((y) => y + 1);
        } else {
            setViewMonth((m) => m + 1);
        }
    }

    /* ─── Derived data ─── */
    const todayCompleted = habits.filter((h) =>
        isCompleted(h.id, todayStr)
    ).length;
    const todayTotal = habits.length;
    const todayPct = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

    // What day column is "today" in the grid?
    const isCurrentMonth =
        viewYear === now.getFullYear() && viewMonth === now.getMonth();
    const todayDayNum = now.getDate();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <>
            <div className="flex min-h-screen">
                <div className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-8">
                    <div className="flex gap-8">
                        {/* ═══════ LEFT / MAIN COLUMN ═══════ */}
                        <div className="flex-1 min-w-0">
                            {/* ── SECTION A: TODAY'S FOCUS ── */}
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight" style={{ fontFamily: 'Clash Display' }}>
                                        {getGreeting()}, {profile?.full_name || 'there'}.
                                    </h1>
                                    <p className="font-body text-sm text-[#6B6B8A] mt-1">
                                        {formatToday(now)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setModalOpen(true)}
                                    className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-body font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 flex-shrink-0"
                                >
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                    >
                                        <path
                                            d="M8 3v10M3 8h10"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    Add Habit
                                </button>
                            </div>

                            {/* Today's habit list */}
                            {habits.length === 0 ? (
                                <div className="bg-[#111118] border border-white/5 rounded-xl px-6 py-12 text-center mb-10">
                                    <p className="text-[#6B6B8A] font-body text-sm mb-4">
                                        No habits yet. Add your first habit to get started!
                                    </p>
                                    <button
                                        onClick={() => setModalOpen(true)}
                                        className="text-purple-400 hover:text-purple-300 font-body font-medium text-sm transition-colors"
                                    >
                                        + Add your first habit
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2 mb-10">
                                    {habits.map((habit) => {
                                        const done = isCompleted(habit.id, todayStr);
                                        const streak = getStreak(habit.id);

                                        return (
                                            <motion.div
                                                key={habit.id}
                                                whileTap={{ scale: 0.98 }}
                                                transition={{ duration: 0.1 }}
                                                onClick={() => toggleHabit(habit.id, todayStr)}
                                                className="flex items-center gap-4 bg-[#111118] border border-white/5 rounded-xl px-4 py-3 hover:border-white/10 transition-all cursor-pointer group"
                                            >
                                                {/* Checkbox */}
                                                <div
                                                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${done
                                                        ? "border-purple-500 bg-purple-500"
                                                        : "border-white/20 bg-transparent group-hover:border-purple-500/50"
                                                        }`}
                                                >
                                                    {done && (
                                                        <svg
                                                            width="12"
                                                            height="12"
                                                            viewBox="0 0 16 16"
                                                            fill="none"
                                                        >
                                                            <path
                                                                d="M3.5 8.5L6.5 11.5L12.5 4.5"
                                                                stroke="white"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        </svg>
                                                    )}
                                                </div>

                                                {/* Emoji */}
                                                <span className="text-xl">{habit.icon || "🎯"}</span>

                                                {/* Name */}
                                                <span
                                                    className={`font-body font-medium text-[15px] ${done ? "text-white/50 line-through" : "text-white"
                                                        }`}
                                                >
                                                    {habit.name}
                                                </span>

                                                {/* Streak badge */}
                                                <span className="ml-auto flex items-center gap-1 text-sm font-body font-medium">
                                                    {streak > 0 ? (
                                                        <span className="text-orange-400">
                                                            🔥 {streak}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[#6B6B8A] text-xs">No streak</span>
                                                    )}
                                                </span>

                                                {/* Options menu */}
                                                <HabitOptionsMenu
                                                    habitId={habit.id}
                                                    onArchive={archiveHabit}
                                                    onDelete={deleteHabit}
                                                />
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* ── SECTION B: MONTHLY GRID ── */}
                            {habits.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="font-body font-medium text-white text-[16px]">
                                            Monthly Overview
                                        </h2>
                                        <div className="flex items-center gap-3 text-sm">
                                            <button
                                                onClick={prevMonth}
                                                className="text-[#6B6B8A] hover:text-white transition-colors px-1"
                                            >
                                                <svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 16 16"
                                                    fill="none"
                                                >
                                                    <path
                                                        d="M10 12L6 8l4-4"
                                                        stroke="currentColor"
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            </button>
                                            <span className="font-body text-white text-sm font-medium min-w-[140px] text-center">
                                                {MONTHS[viewMonth]} {viewYear}
                                            </span>
                                            <button
                                                onClick={nextMonth}
                                                className="text-[#6B6B8A] hover:text-white transition-colors px-1"
                                            >
                                                <svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 16 16"
                                                    fill="none"
                                                >
                                                    <path
                                                        d="M6 4l4 4-4 4"
                                                        stroke="currentColor"
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-[#111118] border border-white/5 rounded-xl p-4">
                                        <div className="overflow-x-auto hide-scrollbar">
                                            <table className="min-w-max w-full">
                                                <thead>
                                                    <tr>
                                                        <th className="text-left px-4 py-3 font-body text-xs text-[#6B6B8A] uppercase tracking-wider w-[140px]">
                                                            Habit
                                                        </th>
                                                        {Array.from({ length: daysInMonth }, (_, i) => {
                                                            const dayNum = i + 1;
                                                            const isTodayCol = isCurrentMonth && dayNum === todayDayNum;

                                                            return (
                                                                <th
                                                                    key={dayNum}
                                                                    className={`w-8 text-center py-3 text-xs font-body ${isTodayCol ? "text-purple-400 font-semibold" : "text-[#6B6B8A]"
                                                                        }`}
                                                                >
                                                                    {dayNum}
                                                                </th>
                                                            );
                                                        })}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {habits.map((habit) => (
                                                        <tr key={habit.id} className="border-t border-white/5">
                                                            <td className="px-4 py-2">
                                                                <div className="flex items-center gap-2 max-w-[140px] group">
                                                                    <span className="text-sm">{habit.icon || "🎯"}</span>
                                                                    <span className="font-body text-sm text-white truncate">
                                                                        {habit.name}
                                                                    </span>
                                                                    <HabitOptionsMenu
                                                                        habitId={habit.id}
                                                                        onArchive={archiveHabit}
                                                                        onDelete={deleteHabit}
                                                                    />
                                                                </div>
                                                            </td>
                                                            {Array.from({ length: daysInMonth }, (_, i) => {
                                                                const dayNum = i + 1;
                                                                const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                                                                const done = isCompleted(habit.id, dateStr);
                                                                const isTodayCol = isCurrentMonth && dayNum === todayDayNum;

                                                                return (
                                                                    <td key={dayNum} className="p-0.5">
                                                                        <div
                                                                            onClick={() => toggleHabit(habit.id, dateStr)}
                                                                            className={`w-7 h-7 rounded-md flex items-center justify-center transition-all duration-150 mx-auto cursor-pointer ${done
                                                                                ? "bg-purple-500 hover:bg-purple-400"
                                                                                : "bg-white/5 hover:bg-white/10"
                                                                                } ${isTodayCol
                                                                                    ? "ring-1 ring-purple-500/30"
                                                                                    : ""
                                                                                }`}
                                                                        >
                                                                            {done && (
                                                                                <svg
                                                                                    width="10"
                                                                                    height="8"
                                                                                    viewBox="0 0 10 8"
                                                                                    fill="none"
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                >
                                                                                    <path
                                                                                        d="M1 4L3.5 6.5L9 1"
                                                                                        stroke="white"
                                                                                        strokeWidth="1.5"
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                    />
                                                                                </svg>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ═══════ RIGHT SIDEBAR ═══════ */}
                        <div className="w-72 flex-shrink-0 hidden lg:block">
                            {/* Overall today card */}
                            <div className="bg-[#111118] border border-white/5 rounded-xl p-5 mb-6">
                                <p className="font-body font-medium text-white text-[13px] mb-3">
                                    Today&apos;s Progress
                                </p>
                                <p className="font-display font-bold text-[36px] text-white leading-none">
                                    {todayCompleted}/{todayTotal}
                                </p>
                                {/* Progress bar */}
                                <div className="bg-white/5 rounded-full h-1.5 mt-3 overflow-hidden">
                                    <div
                                        className="bg-purple-500 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${todayPct}%` }}
                                    />
                                </div>
                                <p className="font-body text-[#6B6B8A] text-[12px] mt-2">
                                    habits completed
                                </p>
                            </div>

                            {/* Per-habit progress list */}
                            <div className="space-y-4">
                                {habits.map((habit) => {
                                    const streak = getStreak(habit.id);
                                    const { completed, total } = getMonthlyProgress(habit.id);
                                    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

                                    return (
                                        <div
                                            key={habit.id}
                                            className="bg-[#111118] border border-white/5 rounded-xl p-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm">{habit.icon || "🎯"}</span>
                                                    <span className="font-body font-medium text-[13px] text-white">
                                                        {habit.name}
                                                    </span>
                                                </div>
                                                <span className="flex items-center gap-1 text-xs font-body font-medium">
                                                    {streak > 0 ? (
                                                        <span className="text-orange-400">
                                                            🔥 {streak} day{streak > 1 ? "s" : ""}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[#6B6B8A] text-xs">No streak</span>
                                                    )}
                                                </span>
                                            </div>
                                            {/* Progress bar */}
                                            <div className="bg-white/5 rounded-full h-1.5 mt-3 overflow-hidden">
                                                <div
                                                    className="bg-purple-500 h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs font-body mt-1">
                                                <span className="text-sm font-medium text-white">{pct}%</span>
                                                <span className="text-[#6B6B8A]">
                                                    {completed} of {total} days
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Habit Modal */}
            <AddHabitModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onHabitAdded={fetchData}
                userId={profile?.id || ''}
            />
        </>
    );
}
