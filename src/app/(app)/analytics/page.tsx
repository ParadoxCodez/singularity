"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, CartesianGrid } from "recharts";

/* ─── Types ─── */
interface Habit {
    id: string;
    name: string;
    icon: string;
    color: string;
    created_at: string;
}

interface HabitLog {
    id: string;
    habit_id: string;
    completed_date: string;
    completed: boolean;
}

function toDateStr(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function AnalyticsPage() {
    const supabase = createClient();
    const currentYear = new Date().getFullYear();
    const today = new Date();

    const [habits, setHabits] = useState<Habit[]>([]);
    const [logs, setLogs] = useState<HabitLog[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAnalyticsData = useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 89);
        const startDate = ninetyDaysAgo.toISOString().split('T')[0];
        const endDate = new Date().toISOString().split('T')[0];

        const [{ data: habitsData }, { data: logsData }] = await Promise.all([
            supabase.from("habits").select("*").eq("is_archived", false),
            supabase.from("habit_logs").select("*")
                .gte("completed_date", startDate)
                .lte("completed_date", endDate)
        ]);

        setHabits(habitsData || []);
        setLogs(logsData || []);
        setLoading(false);
    }, [supabase, currentYear]);

    useEffect(() => {
        fetchAnalyticsData();
    }, [fetchAnalyticsData]);

    // --- Computed Values ---

    const startOfYear = new Date(currentYear, 0, 1);
    const daysPassed = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const totalPossible = habits.length * daysPassed;
    const totalCompleted = logs.filter((l) => l.completed).length;
    const overallRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    function getStreak(habitId: string): number {
        let streak = 0;
        const d = new Date();
        while (true) {
            const dateStr = toDateStr(d);
            const found = logs.find((l) => l.habit_id === habitId && l.completed_date === dateStr && l.completed);
            if (!found) break;
            streak++;
            d.setDate(d.getDate() - 1);
        }
        return streak;
    }

    const bestStreak = habits.length > 0 ? Math.max(...habits.map((h) => getStreak(h.id))) : 0;

    const logsByDate = logs.reduce((acc, log) => {
        if (!acc[log.completed_date]) acc[log.completed_date] = new Set<string>();
        if (log.completed) acc[log.completed_date].add(log.habit_id);
        return acc;
    }, {} as Record<string, Set<string>>);

    const perfectDays = Object.entries(logsByDate)
        .filter(([date, habitSet]) => habits.length > 0 && habitSet.size >= habits.length)
        .map(([date]) => date);

    const totalCheckIns = logs.filter((l) => l.completed).length;

    const habitRates = [...habits].map((habit) => {
        const habitLogs = logs.filter((l) => l.habit_id === habit.id && l.completed);
        const rate = daysPassed > 0 ? Math.round((habitLogs.length / daysPassed) * 100) : 0;
        return { ...habit, rate, completedDays: habitLogs.length };
    }).sort((a, b) => b.rate - a.rate);

    const weeklyData = Array.from({ length: 12 }, (_, i) => {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (11 - i) * 7);
        weekStart.setHours(0, 0, 0, 0); // normalize start of week

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const weekLogs = logs.filter((l) => {
            const d = new Date(l.completed_date + "T00:00:00");
            return d >= weekStart && d <= weekEnd && l.completed;
        });

        const possible = habits.length * 7;
        const rate = possible > 0 ? Math.round((weekLogs.length / possible) * 100) : 0;
        const label = weekStart.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
        return { week: label, rate };
    });

    // Last 90 days ending today
    const heatmapData = Array.from({ length: 90 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (89 - i))
        const dateStr = d.toISOString().split('T')[0]
        const dayHabitSet = logsByDate[dateStr]
        if (!dayHabitSet || habits.length === 0) return { date: dateStr, level: 0 }
        const pct = dayHabitSet.size / habits.length
        if (pct === 0) return { date: dateStr, level: 0 }
        if (pct <= 0.3) return { date: dateStr, level: 1 }
        if (pct <= 0.6) return { date: dateStr, level: 2 }
        if (pct <= 0.9) return { date: dateStr, level: 3 }
        return { date: dateStr, level: 4 }
    });

    // Group into weeks — pad first week to start on Monday
    const firstDate = new Date()
    firstDate.setDate(firstDate.getDate() - 89)
    const firstDayOfWeek = firstDate.getDay()
    const startPadding = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

    const paddedDays = [
        ...Array(startPadding).fill(null),
        ...heatmapData
    ]

    const weeks: (typeof heatmapData[0] | null)[][] = []
    for (let i = 0; i < paddedDays.length; i += 7) {
        weeks.push(paddedDays.slice(i, i + 7))
    }

    const getCompletionText = (dateStr: string) => {
        if (!logsByDate[dateStr] || habits.length === 0) return `0/${habits.length} habits · 0%`;
        const completed = logsByDate[dateStr].size;
        return `${completed}/${habits.length} habits · ${Math.round((completed / habits.length) * 100)}%`;
    };

    const currentMonthDate = new Date();
    const daysInCurrentMonthCount = new Date(currentYear, currentMonthDate.getMonth() + 1, 0).getDate();
    const firstDayOfCurrentMonth = new Date(currentYear, currentMonthDate.getMonth(), 1).getDay();
    // Adjust so Monday is 0, Sunday is 6
    const adjustedFirstDay = (firstDayOfCurrentMonth + 6) % 7;

    // Build current month calendar array
    const currentMonthCalendar = [];
    for (let i = 0; i < adjustedFirstDay; i++) {
        currentMonthCalendar.push(null);
    }
    for (let i = 1; i <= daysInCurrentMonthCount; i++) {
        const d = new Date(currentYear, currentMonthDate.getMonth(), i);
        currentMonthCalendar.push(toDateStr(d));
    }

    // Compute milestone unlock conditions
    const totalCheckInsAllTime = logs.filter(l => l.completed).length;

    // Longest streak across all habits ever
    function getLongestStreakEver(habitId: string): number {
        const habitLogs = logs
            .filter(l => l.habit_id === habitId && l.completed)
            .map(l => l.completed_date)
            .sort();
        let longest = 0;
        let current = 0;
        for (let i = 0; i < habitLogs.length; i++) {
            if (i === 0) { current = 1; continue; }
            const prev = new Date(habitLogs[i - 1]);
            const curr = new Date(habitLogs[i]);
            const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
            if (diff === 1) { current++; } else { current = 1; }
            longest = Math.max(longest, current);
        }
        return Math.max(longest, current);
    }
    const longestStreakEver = habits.length > 0
        ? Math.max(...habits.map(h => getLongestStreakEver(h.id)))
        : 0;

    const milestones = [
        {
            id: 'first_checkin',
            emoji: '✅',
            title: 'First Check-in',
            description: 'Complete your first habit.',
            unlocked: totalCheckInsAllTime >= 1,
        },
        {
            id: 'seven_day_streak',
            emoji: '🔥',
            title: '7-Day Streak',
            description: 'Maintain any habit for 7 days in a row.',
            unlocked: longestStreakEver >= 7,
        },
        {
            id: 'first_perfect_day',
            emoji: '⭐',
            title: 'Perfect Day',
            description: 'Complete every habit in a single day.',
            unlocked: perfectDays.length >= 1,
        },
        {
            id: 'thirty_checkins',
            emoji: '💪',
            title: '30 Check-ins',
            description: 'Log 30 total habit completions.',
            unlocked: totalCheckInsAllTime >= 30,
        },
        {
            id: 'fourteen_day_streak',
            emoji: '⚡',
            title: '14-Day Streak',
            description: 'Maintain any habit for 14 days in a row.',
            unlocked: longestStreakEver >= 14,
        },
        {
            id: 'three_perfect_days',
            emoji: '🏆',
            title: '3 Perfect Days',
            description: 'Achieve 3 perfect days total.',
            unlocked: perfectDays.length >= 3,
        },
        {
            id: 'hundred_checkins',
            emoji: '🌟',
            title: '100 Check-ins',
            description: 'Log 100 total habit completions.',
            unlocked: totalCheckInsAllTime >= 100,
        },
        {
            id: 'thirty_day_streak',
            emoji: '👑',
            title: '30-Day Streak',
            description: 'Maintain any habit for 30 days in a row.',
            unlocked: longestStreakEver >= 30,
        },
    ];

    const unlockedCount = milestones.filter(m => m.unlocked).length;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0F]">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
                    <div className="mb-8">
                        <h1 className="font-display text-[32px] text-white leading-tight">Analytics</h1>
                        <div className="text-[#6B6B8A] font-body text-sm mt-1">Your growth at a glance · {currentYear}</div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-[#111118] rounded-xl h-28 animate-pulse" />
                        <div className="bg-[#111118] rounded-xl h-28 animate-pulse" />
                        <div className="bg-[#111118] rounded-xl h-28 animate-pulse" />
                        <div className="bg-[#111118] rounded-xl h-28 animate-pulse" />
                    </div>

                    <div className="bg-[#111118] rounded-xl h-40 animate-pulse mb-6" />

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
                        <div className="lg:col-span-3 bg-[#111118] rounded-xl h-64 animate-pulse" />
                        <div className="lg:col-span-2 bg-[#111118] rounded-xl h-64 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (habits.length === 0) {
        return (
            <div className="min-h-screen bg-[#0A0A0F]">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
                    <div className="mb-8">
                        <h1 className="font-display text-[32px] text-white leading-tight">Analytics</h1>
                        <div className="text-[#6B6B8A] font-body text-sm mt-1">Your growth at a glance · {currentYear}</div>
                    </div>

                    <div className="bg-[#111118] border border-white/5 rounded-xl p-16 text-center mt-8">
                        <div className="text-5xl mb-4">📊</div>
                        <p className="text-white font-body font-medium text-base mb-2">No data yet</p>
                        <p className="text-[#6B6B8A] font-body text-sm">Add habits and start tracking to see your analytics.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0F]">
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">

                {/* SECTION 1 — PAGE HEADER */}
                <div className="mb-8">
                    <h1 className="font-display text-[32px] text-white leading-tight">Analytics</h1>
                    <div className="text-[#6B6B8A] font-body text-sm mt-1">Your growth at a glance · {currentYear}</div>
                </div>

                {/* SECTION 2 — STAT CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-[#111118] border border-white/5 rounded-xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl" style={{ background: '#7C3AED' }} />
                        <div className="text-[#6B6B8A] text-xs uppercase tracking-widest font-body mb-2">Completion Rate</div>
                        <div className="font-display text-4xl text-white">{overallRate}%</div>
                        <div className="text-[#6B6B8A] text-xs mt-1 font-body">this year</div>
                        <div className="bg-white/5 rounded-full h-1 mt-3 overflow-hidden">
                            <div className="bg-purple-500 rounded-full h-full" style={{ width: `${overallRate}%` }} />
                        </div>
                    </div>

                    <div className="bg-[#111118] border border-white/5 rounded-xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl" style={{ background: '#F97316' }} />
                        <div className="text-[#6B6B8A] text-xs uppercase tracking-widest font-body mb-2">Best Streak</div>
                        <div>
                            <span className="font-display text-4xl text-white">{bestStreak}</span>
                            <span className="font-body text-sm text-[#6B6B8A] ml-1">days</span>
                        </div>
                        <div className="text-[#6B6B8A] text-xs mt-1 font-body mb-2">current longest streak</div>
                        <div className="text-2xl mt-2">🔥</div>
                    </div>

                    <div className="bg-[#111118] border border-white/5 rounded-xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl" style={{ background: '#34D399' }} />
                        <div className="text-[#6B6B8A] text-xs uppercase tracking-widest font-body mb-2">Perfect Days</div>
                        <div className="font-display text-4xl text-white">{perfectDays.length}</div>
                        <div className="text-[#6B6B8A] text-xs mt-1 font-body">all habits completed</div>
                        <div className="text-xs text-[#6B6B8A] mt-2 font-body">out of {daysPassed} days this year</div>
                    </div>

                    <div className="bg-[#111118] border border-white/5 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl" style={{ background: '#60A5FA' }} />
                        <div>
                            <div className="text-[#6B6B8A] text-xs uppercase tracking-widest font-body mb-2">Total Check-ins</div>
                            <div className="font-display text-4xl text-white">{totalCheckIns}</div>
                            <div className="text-[#6B6B8A] text-xs mt-1 font-body mb-2">habits completed ever</div>
                        </div>

                        <div className="flex gap-1.5 mt-2">
                            {Array.from({ length: 7 }, (_, i) => {
                                const d = new Date();
                                d.setDate(d.getDate() - (6 - i));
                                const dateStr = toDateStr(d);
                                const hasActivity = logs.some((l: HabitLog) => l.completed_date === dateStr && l.completed);
                                return (
                                    <div key={dateStr} className={`w-2.5 h-2.5 rounded-full ${hasActivity ? 'bg-purple-500' : 'bg-white/10'}`} />
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* SECTION 3 — HABIT HEATMAP */}
                <div className="bg-[#111118] border border-white/5 rounded-xl p-8 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl" style={{ background: 'linear-gradient(to right, #7C3AED, #A855F7, transparent)' }} />
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-display text-lg text-white">Habit Activity</h3>
                        <span className="text-[10px] text-[#6B6B8A]">Last 90 days</span>
                    </div>

                    <div className="lg:hidden py-6 text-center">
                        <p className="text-3xl mb-3">📊</p>
                        <p className="text-white text-sm font-medium mb-1" style={{ fontFamily: 'Satoshi' }}>
                            Habit Activity Heatmap
                        </p>
                        <p className="text-[#6B6B8A] text-xs" style={{ fontFamily: 'Satoshi' }}>
                            View on desktop for the full heatmap
                        </p>
                    </div>

                    <div className="hidden lg:block w-full overflow-x-auto hide-scrollbar">
                        {/* Month labels */}
                        <div className="flex mb-2 ml-8">
                            {(() => {
                                // Calculate month labels dynamically from actual heatmap dates
                                const labels: { month: string; weekIndex: number }[] = []
                                weeks.forEach((week, wi) => {
                                    week.forEach(day => {
                                        if (day && day.date) {
                                            const d = new Date(day.date)
                                            if (d.getDate() <= 7) {
                                                const monthName = d.toLocaleString('default', { month: 'short' })
                                                if (!labels.find(l => l.month === monthName)) {
                                                    labels.push({ month: monthName, weekIndex: wi })
                                                }
                                            }
                                        }
                                    })
                                })
                                return labels.map((label, i) => {
                                    const nextWeekIndex = labels[i + 1]?.weekIndex ?? weeks.length;
                                    const colSpan = nextWeekIndex - label.weekIndex;
                                    return (
                                        <div
                                            key={label.month}
                                            style={{ width: `${colSpan * 16}px`, minWidth: `${colSpan * 16}px` }}
                                            className="text-[10px] text-[#6B6B8A] flex-shrink-0"
                                        >
                                            {label.month}
                                        </div>
                                    );
                                });
                            })()}
                        </div>

                        {/* Grid */}
                        <div className="flex gap-0">
                            {/* Day labels */}
                            <div className="flex flex-col justify-around mr-2 pb-0.5" style={{ height: `${7 * 16}px` }}>
                                {['Mon', '', 'Wed', '', 'Fri', '', ''].map((label, i) => (
                                    <div key={i} className="text-[10px] text-[#6B6B8A] h-[13px] flex items-center leading-none">
                                        {label}
                                    </div>
                                ))}
                            </div>

                            {/* Week columns */}
                            <div className="flex gap-[3px]">
                                {weeks.map((week, wi) => (
                                    <div key={wi} className="flex flex-col gap-[3px]">
                                        {week.map((day, di) => {
                                            if (!day) {
                                                return <div key={di} className="w-[13px] h-[13px]" />;
                                            }
                                            const levelColors = [
                                                'bg-white/5',
                                                'bg-purple-900',
                                                'bg-purple-700',
                                                'bg-purple-500',
                                                'bg-purple-400',
                                            ];
                                            return (
                                                <div
                                                    key={di}
                                                    title={`${day.date}`}
                                                    className={`w-[13px] h-[13px] rounded-sm cursor-pointer transition-all duration-150 hover:ring-1 hover:ring-purple-400/60 hover:scale-110 ${levelColors[day.level]}`}
                                                />
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-2 justify-end mt-3">
                            <span className="text-[10px] text-[#6B6B8A]">Less</span>
                            {['bg-white/5', 'bg-purple-900', 'bg-purple-700', 'bg-purple-500', 'bg-purple-400'].map((bg, i) => (
                                <div key={i} className={`w-[13px] h-[13px] rounded-sm ${bg}`} />
                            ))}
                            <span className="text-[10px] text-[#6B6B8A]">More</span>
                        </div>
                    </div>
                </div>

                {/* SECTION 4 — TWO COLUMN: LINE CHART + HABITS LIST */}
                <p className="text-[10px] uppercase tracking-widest text-[#6B6B8A] mb-4 mt-2" style={{ fontFamily: 'Satoshi' }}>Habit Performance</p>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
                    <div className="lg:col-span-3 bg-[#111118] border border-white/5 rounded-xl p-5">
                        <div className="flex flex-col mb-1">
                            <h3 className="font-body font-medium text-sm text-white">Weekly Completion Rate</h3>
                            <span className="font-body text-xs text-[#6B6B8A]">Last 12 weeks</span>
                        </div>
                        <div className="mt-4">
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                    <XAxis
                                        dataKey="week"
                                        tick={{ fill: '#6B6B8A', fontSize: 10 }}
                                        axisLine={false}
                                        tickLine={false}
                                        interval={2}
                                    />
                                    <YAxis
                                        domain={[0, 100]}
                                        tick={{ fill: '#6B6B8A', fontSize: 10 }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(v: any) => `${v}%`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: '#1A1A24',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            borderRadius: '8px',
                                            color: '#F1F0FF',
                                            fontSize: '12px',
                                        }}
                                        formatter={(value: any) => [`${value}%`, 'Completion'] as any}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="rate"
                                        stroke="#7C3AED"
                                        strokeWidth={2}
                                        fill="url(#rateGradient)"
                                        dot={{ fill: '#7C3AED', r: 3, strokeWidth: 0 }}
                                        activeDot={{ fill: '#A855F7', r: 5, strokeWidth: 0 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="lg:col-span-2 bg-[#111118] border border-white/5 rounded-xl p-5">
                        <h3 className="font-body font-medium text-sm text-white mb-4">Habits Ranked</h3>
                        {habitRates.length === 0 ? (
                            <div className="text-[#6B6B8A] font-body text-sm text-center py-8">
                                No habits added yet
                            </div>
                        ) : (
                            habitRates.map((habit, index) => (
                                <div key={habit.id} className="flex items-center gap-3 mb-4 last:mb-0">
                                    <div className="text-xs text-[#6B6B8A] w-4 flex-shrink-0 font-medium font-body">{index + 1}</div>
                                    <div className="text-lg flex-shrink-0">{habit.icon}</div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <div className="font-body font-medium text-sm text-white truncate">{habit.name}</div>
                                        <div className="bg-white/5 rounded-full h-1.5 mt-1.5 overflow-hidden">
                                            <div className="bg-purple-500 rounded-full h-full transition-all" style={{ width: `${habit.rate}%` }} />
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end flex-shrink-0">
                                        <div className="font-body font-medium text-sm text-white">
                                            {habit.rate}% {index === 0 && '🏆'}
                                        </div>
                                        <div className="text-[#6B6B8A] text-[10px] font-body">
                                            {habit.completedDays}d
                                        </div>
                                        {index === habitRates.length - 1 && habitRates.length > 1 && (
                                            <div className="text-[10px] text-[#6B6B8A] mt-0.5 font-body">needs focus</div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* SECTION 5 — PERFECT DAYS */}
                <p className="text-[10px] uppercase tracking-widest text-[#6B6B8A] mb-4" style={{ fontFamily: 'Satoshi' }}>Milestones</p>
                <div className="bg-[#111118] border border-white/5 rounded-xl p-6 relative overflow-hidden mb-8">
                    {/* Top border accent */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl bg-gradient-to-r from-purple-500 via-purple-400 to-transparent" />

                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-[#6B6B8A] mb-1" style={{ fontFamily: 'Satoshi' }}>
                                MILESTONES
                            </p>
                            <h3 className="text-white font-semibold text-lg" style={{ fontFamily: 'Clash Display' }}>
                                Your Achievements
                            </h3>
                        </div>
                        <div className="text-right">
                            <p className="text-white font-semibold text-2xl" style={{ fontFamily: 'Clash Display' }}>
                                {unlockedCount}
                                <span className="text-[#6B6B8A] text-base font-normal">/{milestones.length}</span>
                            </p>
                            <p className="text-[#6B6B8A] text-xs mt-0.5" style={{ fontFamily: 'Satoshi' }}>unlocked</p>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="bg-white/5 rounded-full h-1.5 mb-6">
                        <div
                            className="bg-purple-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${(unlockedCount / milestones.length) * 100}%` }}
                        />
                    </div>

                    {/* Milestones grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {milestones.map((milestone) => (
                            <div
                                key={milestone.id}
                                className={`relative rounded-xl p-4 border transition-all duration-200 ${milestone.unlocked
                                    ? 'bg-purple-500/10 border-purple-500/25 hover:border-purple-500/40'
                                    : 'bg-white/3 border-white/5 opacity-50'
                                    }`}
                            >
                                {/* Lock icon for locked milestones */}
                                {!milestone.unlocked && (
                                    <div className="absolute top-3 right-3 text-[10px] text-[#6B6B8A]">🔒</div>
                                )}
                                {/* Unlocked checkmark */}
                                {milestone.unlocked && (
                                    <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                                        <span className="text-white text-[8px] font-bold">✓</span>
                                    </div>
                                )}
                                {/* Emoji */}
                                <div className={`text-2xl mb-2 ${!milestone.unlocked ? 'grayscale' : ''}`}>
                                    {milestone.emoji}
                                </div>
                                {/* Title */}
                                <p className={`text-xs font-medium mb-1 ${milestone.unlocked ? 'text-white' : 'text-[#6B6B8A]'}`}
                                    style={{ fontFamily: 'Satoshi' }}>
                                    {milestone.title}
                                </p>
                                {/* Description */}
                                <p className="text-[10px] text-[#6B6B8A] leading-relaxed" style={{ fontFamily: 'Satoshi' }}>
                                    {milestone.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
