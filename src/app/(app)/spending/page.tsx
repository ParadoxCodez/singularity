"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

/* ─── Types ─── */
interface Transaction {
    id: string;
    user_id: string;
    amount: number;
    type: string;
    category: string;
    note: string | null;
    transaction_date: string;
    created_at: string;
}

const CATEGORIES = [
    { value: 'Food', emoji: '🍔', color: '#F87171' },
    { value: 'Transport', emoji: '🚗', color: '#FB923C' },
    { value: 'Shopping', emoji: '🛍️', color: '#A78BFA' },
    { value: 'Health', emoji: '💊', color: '#34D399' },
    { value: 'Entertainment', emoji: '🎮', color: '#60A5FA' },
    { value: 'Education', emoji: '📚', color: '#FBBF24' },
    { value: 'Housing', emoji: '🏠', color: '#F472B6' },
    { value: 'Utilities', emoji: '⚡', color: '#38BDF8' },
    { value: 'Other', emoji: '📦', color: '#94A3B8' },
];

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

function toDateStr(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export default function SpendingPage() {
    const supabase = createClient();
    const today = toDateStr(new Date());

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMonth, setViewMonth] = useState(new Date());
    const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

    const [amount, setAmount] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Food');
    const [note, setNote] = useState('');
    const [txDay, setTxDay] = useState<string>(String(new Date().getDate()).padStart(2, '0'));
    const [txMonth, setTxMonth] = useState<string>(String(new Date().getMonth() + 1).padStart(2, '0'));
    const [txYear, setTxYear] = useState<string>(String(new Date().getFullYear()));
    const txDate = `${txYear}-${txMonth.padStart(2, '0')}-${txDay.padStart(2, '0')}`;
    const [isAdding, setIsAdding] = useState(false);
    const [userId, setUserId] = useState<string>("");

    useEffect(() => {
        async function fetchUser() {
            if (!supabase) return;
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        }
        fetchUser();
    }, [supabase]);

    const fetchTransactions = useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        const year = viewMonth.getFullYear();
        const month = String(viewMonth.getMonth() + 1).padStart(2, '0');
        const startDate = `${year}-${month}-01`;
        const lastDay = new Date(year, viewMonth.getMonth() + 1, 0).getDate();
        const endDate = `${year}-${month}-${lastDay}`;

        const { data } = await supabase
            .from('transactions')
            .select('*')
            .gte('transaction_date', startDate)
            .lte('transaction_date', endDate)
            .order('transaction_date', { ascending: false });

        setTransactions(data || []);
        setLoading(false);
    }, [supabase, viewMonth]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    useEffect(() => {
        const handleClickOutside = () => setConfirmingDelete(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const totalSpent = transactions
        .filter((t: Transaction) => t.type === 'expense')
        .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);

    const categoryTotals = CATEGORIES.map((cat: { value: string; emoji: string; color: string }) => ({
        ...cat,
        total: transactions
            .filter((t: Transaction) => t.category === cat.value && t.type === 'expense')
            .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0)
    })).filter((c: { value: string; emoji: string; color: string; total: number }) => c.total > 0).sort((a: { total: number }, b: { total: number }) => b.total - a.total);

    const topCategory = categoryTotals.length > 0 ? categoryTotals[0] : null;

    const groupedTransactions = transactions.reduce((groups: Record<string, Transaction[]>, tx: Transaction) => {
        const date = tx.transaction_date;
        if (!groups[date]) groups[date] = [];
        groups[date].push(tx);
        return groups;
    }, {} as Record<string, Transaction[]>);

    async function addTransaction() {
        if (!amount || parseFloat(amount) <= 0) return
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { console.error('No session'); return }

        setIsAdding(true)
        const { error } = await supabase.from('transactions').insert({
            user_id: session.user.id,
            amount: parseFloat(amount),
            type: 'expense',
            category: selectedCategory,
            note: note || null,
            transaction_date: `${txYear}-${txMonth}-${txDay}`,
        })

        if (error) {
            console.error('Add transaction error:', error.message)
        } else {
            setAmount('')
            setNote('')
            await fetchTransactions()
        }
        setIsAdding(false)
    }

    async function deleteTransaction(txId: string) {
        const supabase = createClient()
        if (!supabase) return;

        // Get fresh session
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user?.id) {
            console.error('No session found')
            return
        }

        // Optimistic update first
        setTransactions(prev => prev.filter(t => t.id !== txId))
        setConfirmingDelete(null)

        // Then delete from DB
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', txId)

        if (error) {
            console.error('Delete error:', error.message)
            // Refetch to restore if failed
            fetchTransactions()
        }
    }

    const handlePrevMonth = () => {
        setViewMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewMonth(prev => {
            const next = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
            const now = new Date();
            if (next.getFullYear() > now.getFullYear() || (next.getFullYear() === now.getFullYear() && next.getMonth() > now.getMonth())) {
                return prev;
            }
            return next;
        });
    };

    const isCurrentMonth = viewMonth.getFullYear() === new Date().getFullYear() && viewMonth.getMonth() === new Date().getMonth();

    const monthLabel = viewMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

    const chartData = categoryTotals.map((cat: { value: string; emoji: string; color: string; total: number }) => ({
        name: `${cat.emoji} ${cat.value}`,
        amount: cat.total,
        color: cat.color,
    }));

    const formatDateGroup = (dateStr: string) => {
        if (dateStr === today) return "Today";
        const yest = new Date();
        yest.setDate(yest.getDate() - 1);
        if (dateStr === toDateStr(yest)) return "Yesterday";
        const d = new Date(dateStr + "T00:00:00");
        return d.toLocaleString('default', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-[#0A0A0F]">
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
                {/* SECTION 1 — PAGE HEADER */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-[32px] text-white leading-tight">Spending</h1>
                        <div className="flex items-center gap-3 mt-1">
                            <button
                                onClick={handlePrevMonth}
                                className="text-[#6B6B8A] hover:text-white transition-colors text-lg px-1"
                            >
                                &larr;
                            </button>
                            <span className="font-body font-medium text-sm text-[#6B6B8A]">
                                {monthLabel}
                            </span>
                            <button
                                onClick={handleNextMonth}
                                className={`text-lg px-1 transition-colors ${isCurrentMonth ? 'text-[#6B6B8A]/50 cursor-not-allowed' : 'text-[#6B6B8A] hover:text-white'}`}
                                disabled={isCurrentMonth}
                            >
                                &rarr;
                            </button>
                        </div>
                    </div>
                </div>

                {/* SECTION 2 — STAT CARDS ROW */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-[#111118] border border-white/5 rounded-xl p-5">
                        <div className="font-body text-[#6B6B8A] text-xs uppercase tracking-widest mb-2">Total Spent</div>
                        <div className="font-display text-3xl text-white">
                            ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="font-body text-[#6B6B8A] text-xs mt-1">this month</div>
                    </div>

                    <div className="bg-[#111118] border border-white/5 rounded-xl p-5">
                        <div className="font-body text-[#6B6B8A] text-xs uppercase tracking-widest mb-2">Transactions</div>
                        <div className="font-display text-3xl text-white">
                            {transactions.length}
                        </div>
                        <div className="font-body text-[#6B6B8A] text-xs mt-1">logged this month</div>

                        <div className="flex gap-1.5 mt-3">
                            {Array.from({ length: 7 }, (_, i: number) => {
                                const d = new Date();
                                d.setDate(d.getDate() - (6 - i));
                                const dateStr = toDateStr(d);
                                const hasTxs = transactions.some((tx: Transaction) => tx.transaction_date === dateStr);
                                return (
                                    <div key={dateStr} className={`w-2.5 h-2.5 rounded-full ${hasTxs ? 'bg-purple-500' : 'bg-white/10'}`} />
                                );
                            })}
                        </div>
                        <div className="text-[10px] text-[#6B6B8A] mt-1.5 font-body">last 7 days</div>
                    </div>

                    <div className="bg-[#111118] border border-white/5 rounded-xl p-5">
                        <div className="font-body text-[#6B6B8A] text-xs uppercase tracking-widest mb-2">Top Category</div>
                        {categoryTotals.length > 0 && topCategory ? (
                            <>
                                <div className="font-display text-2xl text-white">
                                    {topCategory.emoji} {topCategory.value}
                                </div>
                                <div className="font-body text-[#6B6B8A] text-xs mt-1">
                                    ₹{topCategory.total.toLocaleString('en-IN')} spent
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="font-display text-2xl text-white">—</div>
                                <div className="font-body text-[#6B6B8A] text-xs mt-1">no data yet</div>
                            </>
                        )}
                    </div>
                </div>

                {/* SECTION 3 — MAIN TWO COLUMN LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* LEFT COLUMN */}
                    <div>
                        {/* Add Transaction Card */}
                        <div className="bg-[#111118] border border-white/5 rounded-xl p-5 mb-4">
                            <h3 className="font-body font-medium text-sm text-white mb-4">Add Transaction</h3>
                            <div>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B8A] text-lg pointer-events-none font-body">₹</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        className="w-full bg-[#0A0A0F] border border-white/8 rounded-lg pl-9 pr-4 py-3 text-white text-lg font-medium placeholder:text-[#6B6B8A] focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all font-body"
                                    />
                                </div>

                                <div className="font-body text-[#6B6B8A] text-xs mb-2 mt-3">Category</div>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map((cat: { value: string; emoji: string; color: string }) => (
                                        <button
                                            key={cat.value}
                                            onClick={() => setSelectedCategory(cat.value)}
                                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-body transition-all cursor-pointer flex-shrink-0 ${selectedCategory === cat.value
                                                ? 'bg-purple-500/20 border border-purple-500/40 text-white'
                                                : 'bg-white/5 border border-transparent text-[#6B6B8A] hover:bg-white/8'
                                                }`}
                                        >
                                            <span>{cat.emoji}</span>
                                            <span>{cat.value}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="font-body text-[#6B6B8A] text-xs mb-2 mt-3">Note (optional)</div>
                                <input
                                    type="text"
                                    placeholder="What was this for?"
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    className="w-full bg-[#0A0A0F] border border-white/8 rounded-lg px-3 py-2 text-white text-sm font-medium placeholder:text-[#6B6B8A] focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all font-body"
                                />

                                <div className="font-body text-[#6B6B8A] text-xs mb-2 mt-3">Date</div>
                                <div className="flex gap-2">
                                    <select
                                        value={txDay}
                                        onChange={e => setTxDay(e.target.value)}
                                        className="bg-[#0A0A0F] border border-white/8 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all appearance-none cursor-pointer flex-1 font-body"
                                    >
                                        {Array.from({ length: 31 }, (_, i) => {
                                            const val = String(i + 1).padStart(2, '0');
                                            return <option key={val} value={val}>{val}</option>;
                                        })}
                                    </select>
                                    <select
                                        value={txMonth}
                                        onChange={e => setTxMonth(e.target.value)}
                                        className="bg-[#0A0A0F] border border-white/8 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all appearance-none cursor-pointer flex-1 font-body"
                                    >
                                        {MONTHS.map((m, i) => (
                                            <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={txYear}
                                        onChange={e => setTxYear(e.target.value)}
                                        className="bg-[#0A0A0F] border border-white/8 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all appearance-none cursor-pointer flex-1 font-body"
                                    >
                                        {[new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2].map(y => (
                                            <option key={y} value={String(y)}>{y}</option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    onClick={addTransaction}
                                    disabled={isAdding || !amount || parseFloat(amount) <= 0}
                                    className="w-full mt-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-body"
                                >
                                    {isAdding && (
                                        <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                                    )}
                                    Add Transaction
                                </button>
                            </div>
                        </div>

                        {/* Transaction List */}
                        <div>
                            <div className="flex items-center justify-between mb-3 mt-6">
                                <span className="text-xs uppercase tracking-widest text-[#6B6B8A] font-body">Recent Transactions</span>
                                <span className="text-xs text-[#6B6B8A] font-body">{transactions.length} this month</span>
                            </div>
                            {loading ? (
                                <>
                                    <div className="bg-[#111118] rounded-xl h-16 animate-pulse mb-2" />
                                    <div className="bg-[#111118] rounded-xl h-16 animate-pulse mb-2" />
                                    <div className="bg-[#111118] rounded-xl h-16 animate-pulse mb-2" />
                                </>
                            ) : transactions.length === 0 ? (
                                <div className="bg-[#111118] border border-white/5 rounded-xl p-12 text-center">
                                    <div className="text-4xl mb-4">💸</div>
                                    <p className="text-white font-medium font-body text-sm mb-1">
                                        No transactions in {monthLabel}
                                    </p>
                                    <p className="text-[#6B6B8A] text-xs font-body">
                                        Add your first transaction using the form above.
                                    </p>
                                </div>
                            ) : (
                                Object.entries(groupedTransactions).map(([date, txs]) => (
                                    <div key={date}>
                                        <div className="text-xs text-[#6B6B8A] uppercase tracking-widest font-body mb-2 mt-4 first:mt-0">
                                            {formatDateGroup(date)}
                                        </div>
                                        {txs.map((tx: Transaction) => {
                                            const cat = CATEGORIES.find((c: { value: string }) => c.value === tx.category);
                                            return (
                                                <div key={tx.id} className="flex items-center gap-3 bg-[#111118] border border-white/5 rounded-xl px-4 py-3 mb-2 group relative">
                                                    <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-lg flex-shrink-0">
                                                        {cat?.emoji}
                                                    </div>
                                                    <div className="flex flex-col flex-1 min-w-0">
                                                        <span className="font-body font-medium text-sm text-white">{tx.category}</span>
                                                        <span className="text-[#6B6B8A] text-xs truncate font-body">
                                                            {tx.note ? tx.note : new Date(tx.transaction_date + "T00:00:00").toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-white font-medium text-sm font-body">
                                                            ₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </span>
                                                        <button
                                                            onClick={async (e) => {
                                                                e.stopPropagation()
                                                                if (window.confirm('Delete this transaction?')) {
                                                                    await deleteTransaction(tx.id)
                                                                }
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-[#6B6B8A] hover:text-red-400 text-xs px-2 py-1 rounded"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="flex flex-col gap-4">
                        {/* Bar Chart Card */}
                        <div className="bg-[#111118] border border-white/5 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-body font-medium text-sm text-white">By Category</h3>
                                <span className="font-body text-[#6B6B8A] text-xs">This month</span>
                            </div>
                            {categoryTotals.length === 0 ? (
                                <div className="bg-[#111118] border border-white/5 rounded-xl p-8 text-center mt-4">
                                    <p className="text-white font-medium font-body text-sm mb-1">
                                        No transactions in {monthLabel}
                                    </p>
                                    <p className="text-[#6B6B8A] text-xs font-body">
                                        Add your first transaction using the form above.
                                    </p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={categoryTotals.length * 52 + 20}>
                                    <BarChart
                                        data={chartData}
                                        layout="vertical"
                                        margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
                                    >
                                        <XAxis
                                            type="number"
                                            tick={{ fill: '#6B6B8A', fontSize: 11 }}
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(v: any) => `₹${v}`}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            tick={{ fill: '#F1F0FF', fontSize: 12 }}
                                            axisLine={false}
                                            tickLine={false}
                                            width={110}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                            contentStyle={{
                                                background: '#1A1A24',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                borderRadius: '8px',
                                                color: '#F1F0FF',
                                                fontSize: '13px',
                                            }}
                                            formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 'Spent'] as any}
                                        />
                                        <Bar dataKey="amount" radius={[0, 6, 6, 0]} maxBarSize={32}>
                                            {chartData.map((entry: { name: string; amount: number; color: string }, index: number) => (
                                                <Cell key={index} fill={entry.color} fillOpacity={0.85} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Category Breakdown List Card */}
                        <div className="bg-[#111118] border border-white/5 rounded-xl p-5">
                            <h3 className="font-body font-medium text-sm text-white mb-4">Breakdown</h3>
                            {categoryTotals.length === 0 ? (
                                <div className="bg-[#111118] border border-white/5 rounded-xl p-8 text-center">
                                    <p className="text-white font-medium font-body text-sm mb-1">
                                        No transactions in {monthLabel}
                                    </p>
                                    <p className="text-[#6B6B8A] text-xs font-body">
                                        Add your first transaction using the form above.
                                    </p>
                                </div>
                            ) : (
                                categoryTotals.map((cat: { value: string; emoji: string; color: string; total: number }) => (
                                    <div key={cat.value} className="flex items-center gap-3 mb-4 last:mb-0">
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                                            style={{ backgroundColor: `${cat.color}20` }}
                                        >
                                            {cat.emoji}
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <span className="font-body font-medium text-sm text-white">{cat.value}</span>
                                            <div className="bg-white/5 rounded-full h-1.5 mt-1.5 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${(cat.total / totalSpent * 100).toFixed(0)}%`,
                                                        backgroundColor: cat.color
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="font-body font-medium text-sm text-white">
                                                ₹{cat.total.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                            </span>
                                            <span className="font-body text-[#6B6B8A] text-xs mt-0.5">
                                                {(cat.total / totalSpent * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
