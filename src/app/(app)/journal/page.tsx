"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

/* ─── Types ─── */
interface JournalContent {
    grateful: string;
    accomplished: string;
    tomorrow: string;
    free: string;
}

interface JournalEntry {
    id: string;
    user_id: string;
    entry_date: string;
    mood: string | null;
    content: string | null;
    created_at: string;
    updated_at: string;
}

/* ─── Constants ─── */
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];
const MONTHS_SHORT = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const DAYS_FULL = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

const MOODS = [
    { emoji: "😔", label: "Rough", value: "rough" },
    { emoji: "😕", label: "Low", value: "low" },
    { emoji: "😐", label: "Okay", value: "okay" },
    { emoji: "🙂", label: "Good", value: "good" },
    { emoji: "😄", label: "Great", value: "great" },
];

const PROMPTS: { question: string; field: keyof JournalContent; placeholder: string; minHeight: number }[] = [
    {
        question: "What are you grateful for today?",
        field: "grateful",
        placeholder: "Three things, big or small...",
        minHeight: 80,
    },
    {
        question: "What did you accomplish or make progress on?",
        field: "accomplished",
        placeholder: "Any win counts, no matter how small...",
        minHeight: 80,
    },
    {
        question: "What will you focus on tomorrow?",
        field: "tomorrow",
        placeholder: "One clear intention for the day ahead...",
        minHeight: 80,
    },
];

const EMPTY_CONTENT: JournalContent = { grateful: "", accomplished: "", tomorrow: "", free: "" };

/* ─── Helpers ─── */
function toDateStr(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function parseContent(raw: string | null): JournalContent {
    try {
        return raw ? JSON.parse(raw) : { ...EMPTY_CONTENT };
    } catch {
        return { ...EMPTY_CONTENT };
    }
}

function formatFullDate(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    return `${DAYS_FULL[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatShortDate(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
}

function getDayOfYear(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    const start = new Date(d.getFullYear(), 0, 0);
    const diff = d.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getYearFromDateStr(dateStr: string) {
    return new Date(dateStr + "T00:00:00").getFullYear();
}

function wordCount(content: JournalContent) {
    const all = [content.grateful, content.accomplished, content.tomorrow, content.free]
        .join(" ")
        .trim();
    if (!all) return 0;
    return all.split(/\s+/).filter(Boolean).length;
}

function getPreview(content: JournalContent) {
    const first = content.grateful || content.accomplished || content.tomorrow || content.free || "";
    return first.substring(0, 35);
}

function getMoodEmoji(value: string | null) {
    if (!value) return null;
    const found = MOODS.find((m) => m.value === value);
    return found ? found.emoji : null;
}

/* ─── Auto-grow textarea helper ─── */
function autoGrow(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
}

/* ─── Page ─── */
export default function JournalPage() {
    const today = toDateStr(new Date());

    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(today);
    const [content, setContent] = useState<JournalContent>({ ...EMPTY_CONTENT });
    const [mood, setMood] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [streak, setStreak] = useState(0);
    const [userId, setUserId] = useState("");
    const saveTimeoutRef = useRef<NodeJS.Timeout>();

    const supabase = createClient();

    /* ─── Calculate streak ─── */
    const calcStreak = useCallback((allEntries: JournalEntry[]) => {
        const dateSet = new Set(allEntries.map((e) => e.entry_date));
        let count = 0;
        const d = new Date();
        while (true) {
            const ds = toDateStr(d);
            if (dateSet.has(ds)) {
                count++;
                d.setDate(d.getDate() - 1);
            } else {
                break;
            }
        }
        setStreak(count);
    }, []);

    /* ─── Fetch user ─── */
    useEffect(() => {
        async function fetchUser() {
            if (!supabase) return;
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        }
        fetchUser();
    }, [supabase]);

    /* ─── Fetch entries ─── */
    const fetchEntries = useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        const { data } = await supabase
            .from("journal_entries")
            .select("*")
            .order("entry_date", { ascending: false });
        const all = data || [];
        setEntries(all);
        calcStreak(all);
        setLoading(false);
    }, [supabase, calcStreak]);

    useEffect(() => {
        fetchEntries();
    }, [fetchEntries]);

    /* ─── When selectedDate changes, populate content/mood ─── */
    useEffect(() => {
        const existing = entries.find((e) => e.entry_date === selectedDate);
        if (existing) {
            setContent(parseContent(existing.content));
            setMood(existing.mood);
        } else {
            setContent({ ...EMPTY_CONTENT });
            setMood(null);
        }
        setSaveStatus("saved");
    }, [selectedDate, entries]);

    /* ─── Auto-save ─── */
    useEffect(() => {
        if (loading || !userId) return;
        setSaveStatus("unsaved");
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(async () => {
            setSaveStatus("saving");
            const contentString = JSON.stringify(content);
            const existing = entries.find((e) => e.entry_date === selectedDate);
            if (existing) {
                await supabase!
                    .from("journal_entries")
                    .update({ content: contentString, mood, updated_at: new Date().toISOString() })
                    .eq("id", existing.id);
            } else {
                if (contentString === JSON.stringify(EMPTY_CONTENT) && !mood) {
                    setSaveStatus("saved");
                    return;
                }
                await supabase!
                    .from("journal_entries")
                    .insert({ user_id: userId, entry_date: selectedDate, content: contentString, mood });
            }
            const { data } = await supabase!
                .from("journal_entries")
                .select("*")
                .order("entry_date", { ascending: false });
            const all = data || [];
            setEntries(all);
            calcStreak(all);
            setSaveStatus("saved");
        }, 1500);

        return () => clearTimeout(saveTimeoutRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content, mood]);

    /* ─── Filtered entries for sidebar ─── */
    const filteredEntries = search.trim()
        ? entries.filter((e) =>
            JSON.stringify(parseContent(e.content)).toLowerCase().includes(search.toLowerCase())
        )
        : entries;

    const todayHasEntry = entries.some((e) => e.entry_date === today);

    /* ─── Mobile date strip (last 7 days) ─── */
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return toDateStr(d);
    });

    /* ─── Monthly stats for sidebar ─── */
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const entriesThisMonth = entries.filter((e) => {
        const d = new Date(e.entry_date + "T00:00:00");
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const daysPassedThisMonth = new Date().getDate();

    const moodCounts = entriesThisMonth.reduce((acc, e) => {
        if (e.mood) {
            acc[e.mood] = (acc[e.mood] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const moodBreakdown = Object.entries(moodCounts)
        .map(([value, count]) => ({
            value,
            count,
            mood: MOODS.find((m) => m.value === value),
        }))
        .sort((a, b) => b.count - a.count);

    /* ─── Loading ─── */
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#0A0A0F]">
            <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-8 gap-8">
                {/* ═══════ LEFT SIDEBAR (desktop only) ═══════ */}
                <aside className="w-72 flex-shrink-0 hidden lg:flex flex-col gap-4">
                    {/* Streak card */}
                    <div className="bg-[#111118] border border-white/5 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-body font-medium text-sm text-white">Journal Streak</span>
                            <span className="text-lg">🔥</span>
                        </div>
                        <div className="font-display text-4xl text-white leading-none">
                            {streak}
                        </div>
                        <div className="font-body text-xs text-[#6B6B8A] mt-1">
                            {streak > 0 ? "day streak" : "No streak yet"}
                        </div>
                        <div className="bg-white/5 rounded-full h-1.5 mt-4">
                            <div className="bg-purple-500 rounded-full h-full" style={{ width: `${Math.min((streak / 30) * 100, 100)}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-[#6B6B8A] mt-1 font-body">
                            <span>{streak} days</span>
                            <span>Goal: 30</span>
                        </div>
                    </div>

                    {/* Monthly summary card */}
                    <div className="bg-[#111118] border border-white/5 rounded-xl p-5">
                        <h3 className="font-body font-medium text-sm text-white mb-3">This Month</h3>
                        <div className="font-display text-3xl text-white leading-none">
                            {entriesThisMonth.length}
                        </div>
                        <div className="font-body text-xs text-[#6B6B8A] mt-1">
                            entries written
                        </div>
                        <div className="font-body text-xs text-[#6B6B8A] mt-3">
                            out of {daysPassedThisMonth} days possible
                        </div>
                        <div className="bg-white/5 rounded-full h-1.5 mt-1">
                            <div className="bg-purple-500 rounded-full h-full" style={{ width: `${Math.min((entriesThisMonth.length / daysPassedThisMonth) * 100, 100)}%` }} />
                        </div>
                    </div>

                    {/* Mood breakdown card */}
                    <div className="bg-[#111118] border border-white/5 rounded-xl p-5">
                        <h3 className="font-body font-medium text-sm text-white mb-3">Mood This Month</h3>
                        {moodBreakdown.length > 0 ? (
                            <div className="flex flex-col">
                                {moodBreakdown.map((item) => (
                                    <div key={item.value} className="flex items-center justify-between py-1">
                                        <div className="flex items-center">
                                            <span className="text-base">{item.mood?.emoji}</span>
                                            <span className="font-body text-[#6B6B8A] text-xs ml-2">{item.mood?.label}</span>
                                        </div>
                                        <span className="font-body text-white text-xs font-medium">{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="font-body text-[#6B6B8A] text-xs">No data yet</div>
                        )}
                    </div>

                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search entries..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[#111118] border border-white/5 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-[#6B6B8A] focus:outline-none focus:border-purple-500/40 transition-colors font-body"
                    />

                    {/* Entries list */}
                    <div className="px-1 mt-2 text-[10px] uppercase tracking-widest text-[#6B6B8A] font-body">
                        Past Entries
                    </div>
                    <div className="flex flex-col gap-1 overflow-y-auto hide-scrollbar pb-10">
                        {/* Always show today at top */}
                        {!filteredEntries.some((e) => e.entry_date === today) && (
                            <button
                                onClick={() => setSelectedDate(today)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all text-left ${selectedDate === today
                                    ? "bg-purple-500/10 border border-purple-500/30"
                                    : "bg-[#111118] border border-white/5 hover:border-white/10"
                                    }`}
                            >
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-white font-body">
                                            {formatShortDate(today)}
                                        </span>
                                        <span className="text-[10px] bg-purple-500/20 text-purple-300 rounded-full px-1.5 py-0.5 ml-1.5 font-medium font-body">
                                            Today
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#6B6B8A] truncate max-w-[140px] mt-0.5 font-body">
                                        No entry yet
                                    </p>
                                </div>
                            </button>
                        )}

                        {filteredEntries.map((entry) => {
                            const parsed = parseContent(entry.content);
                            const preview = getPreview(parsed);
                            const moodEmoji = getMoodEmoji(entry.mood);
                            const isToday = entry.entry_date === today;

                            return (
                                <button
                                    key={entry.id}
                                    onClick={() => setSelectedDate(entry.entry_date)}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all text-left ${selectedDate === entry.entry_date
                                        ? "bg-purple-500/10 border border-purple-500/30"
                                        : "bg-[#111118] border border-white/5 hover:border-white/10"
                                        }`}
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white font-body">
                                                {formatShortDate(entry.entry_date)}
                                            </span>
                                            {isToday && (
                                                <span className="text-[10px] bg-purple-500/20 text-purple-300 rounded-full px-1.5 py-0.5 ml-1.5 font-medium font-body">
                                                    Today
                                                </span>
                                            )}
                                        </div>
                                        {preview && (
                                            <p className="text-xs text-[#6B6B8A] truncate max-w-[140px] mt-0.5 font-body">
                                                {preview}
                                            </p>
                                        )}
                                    </div>
                                    {moodEmoji && (
                                        <span className="text-base flex-shrink-0 ml-2">{moodEmoji}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* New entry for today */}
                    {!todayHasEntry && selectedDate !== today && (
                        <button
                            onClick={() => setSelectedDate(today)}
                            className="text-purple-400 text-xs hover:text-purple-300 text-center py-3 cursor-pointer transition-colors font-body"
                        >
                            + New entry for today
                        </button>
                    )}
                </aside>

                {/* ═══════ RIGHT EDITOR ═══════ */}
                <div className="w-full lg:flex-1 min-w-0 lg:max-w-2xl">
                    {/* Mobile date strip */}
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4 py-3 border-b border-white/5 lg:hidden">
                        {last7Days.map((dateStr) => {
                            const d = new Date(dateStr + "T00:00:00");
                            const dayNum = d.getDate();
                            const dayName = DAYS_FULL[d.getDay()].substring(0, 3);
                            const hasEntry = entries.some((e) => e.entry_date === dateStr);
                            const isSelected = selectedDate === dateStr;

                            return (
                                <button
                                    key={dateStr}
                                    onClick={() => setSelectedDate(dateStr)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-body flex-shrink-0 transition-all ${isSelected
                                        ? "bg-purple-500 text-white"
                                        : hasEntry
                                            ? "bg-white/[0.08] text-white border border-white/10"
                                            : "bg-transparent text-[#6B6B8A] border border-white/5"
                                        }`}
                                >
                                    {dayName} {dayNum}
                                </button>
                            );
                        })}
                    </div>

                    {/* Editor content */}
                    <div className="w-full">
                        {/* Editor header */}
                        <div className="flex items-start justify-between mb-6 pb-6 border-b border-white/5">
                            <div>
                                <h1 className="font-display font-bold text-[32px] text-white leading-tight mb-1">
                                    {formatFullDate(selectedDate)}
                                </h1>
                                <p className="font-body text-[#6B6B8A] text-sm mt-1">
                                    Day {getDayOfYear(selectedDate)} of {getYearFromDateStr(selectedDate)}
                                </p>
                            </div>

                            {/* Mood picker */}
                            <div className="flex gap-2 flex-wrap justify-end">
                                {MOODS.map((m) => (
                                    <button
                                        key={m.value}
                                        onClick={() => setMood(mood === m.value ? null : m.value)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${mood === m.value
                                            ? "bg-purple-500/20 border border-purple-500/40 text-white"
                                            : "bg-white/5 border border-transparent text-[#6B6B8A] hover:bg-white/[0.08] hover:text-white"
                                            }`}
                                    >
                                        <span>{m.emoji}</span>
                                        <span className="font-body">{m.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Guided prompts */}
                        <div className="flex flex-col gap-3 w-full">
                            {PROMPTS.map((prompt) => (
                                <div key={prompt.field} className="w-full bg-[#111118] border border-white/5 rounded-xl p-5 transition-all duration-200 focus-within:border-purple-500/30">
                                    <label className="block font-body font-medium text-sm text-purple-300 mb-3">
                                        {prompt.question}
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder={prompt.placeholder}
                                        value={content[prompt.field]}
                                        onChange={(e) =>
                                            setContent((prev) => ({ ...prev, [prompt.field]: e.target.value }))
                                        }
                                        onInput={(e) => autoGrow(e.target as HTMLTextAreaElement)}
                                        className="w-full bg-transparent border-none outline-none resize-none text-white text-[15px] leading-relaxed placeholder:text-[#6B6B8A] min-h-[80px]"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Free writing */}
                        <div className="w-full mt-3 bg-[#0D0D15] border border-white/5 border-l-2 border-l-purple-500/30 rounded-xl p-5 transition-all duration-200 focus-within:border-purple-500/30 focus-within:border-l-purple-500/60">
                            <label className="block text-xs text-[#6B6B8A] uppercase tracking-widest font-body mb-3">
                                FREE THOUGHTS
                            </label>
                            <textarea
                                rows={8}
                                placeholder="Anything on your mind — no structure, no rules..."
                                value={content.free}
                                onChange={(e) =>
                                    setContent((prev) => ({ ...prev, free: e.target.value }))
                                }
                                onInput={(e) => autoGrow(e.target as HTMLTextAreaElement)}
                                className="w-full bg-transparent border-none outline-none resize-none text-white text-[15px] leading-relaxed placeholder:text-[#6B6B8A] font-body min-h-[200px]"
                            />
                        </div>

                        {/* Editor footer */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5 sticky bottom-0 bg-[#0A0A0F] py-3">
                            <span className="text-xs text-[#6B6B8A] font-body">
                                {wordCount(content)} words
                            </span>
                            <span className="text-xs text-[#6B6B8A] font-body">
                                {saveStatus === "saving" && (
                                    <span className="animate-pulse flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full border border-white/20 border-t-white/60 animate-spin" />
                                        Saving...
                                    </span>
                                )}
                                {saveStatus === "saved" && (
                                    <span className="flex items-center gap-1.5">
                                        <span className="text-purple-400">✓</span> Saved
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
