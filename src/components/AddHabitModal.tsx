"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

const EMOJI_OPTIONS = [
    "🏃", "💪", "📚", "✍️", "🧘", "💧", "🥗", "😴",
    "🎯", "🎨", "💻", "🎵", "🌅", "🚴", "🧠", "⚡",
];

interface AddHabitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onHabitAdded: () => void;
    userId: string;
}

export default function AddHabitModal({
    isOpen,
    onClose,
    onHabitAdded,
    userId,
}: AddHabitModalProps) {
    const [habitName, setHabitName] = useState("");
    const [selectedEmoji, setSelectedEmoji] = useState("🎯");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSave = async () => {
        if (!habitName.trim()) {
            setError("Please enter a habit name.");
            return;
        }

        setSaving(true);
        setError("");

        const supabase = createClient();
        if (!supabase) {
            setError("Supabase is not configured.");
            setSaving(false);
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError("User not authenticated.");
            setSaving(false);
            return;
        }

        const { error: insertError } = await supabase.from("habits").insert({
            user_id: user.id,
            name: habitName.trim(),
            icon: selectedEmoji,
        });

        if (insertError) {
            setError(insertError.message);
            setSaving(false);
            return;
        }

        setHabitName("");
        setSelectedEmoji("🎯");
        setSaving(false);
        onHabitAdded();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end lg:items-center justify-center"
                        onClick={onClose}
                    >
                        {/* Modal card */}
                        <motion.div
                            initial={{ y: "100%", opacity: 1 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "100%", opacity: 1 }}
                            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                            className="bg-[#111118] border border-white/[0.08] rounded-t-2xl lg:rounded-2xl p-6 w-full max-w-md lg:max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-display font-bold text-[24px] text-white">
                                    Add New Habit
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="text-[#6B6B8A] hover:text-white transition-colors duration-200 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5"
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                    >
                                        <path
                                            d="M12 4L4 12M4 4l8 8"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </button>
                            </div>

                            {/* Habit name input */}
                            <div className="mb-5">
                                <label className="block font-body text-xs text-[#6B6B8A] uppercase tracking-wider mb-2">
                                    Habit Name
                                </label>
                                <input
                                    type="text"
                                    value={habitName}
                                    onChange={(e) => setHabitName(e.target.value)}
                                    placeholder="e.g. Morning Workout"
                                    className="w-full px-4 py-3 rounded-lg bg-[#0A0A0F] border border-white/[0.06]
                             text-white font-body text-sm placeholder:text-[#3D3D54]
                             focus:outline-none focus:border-[#7C3AED]/50 focus:ring-1 focus:ring-[#7C3AED]/30
                             transition-all duration-200"
                                />
                            </div>

                            {/* Emoji picker */}
                            <div className="mb-6">
                                <label className="block font-body text-[13px] text-[#6B6B8A] mb-3">
                                    Choose an icon
                                </label>
                                <div className="grid grid-cols-8 gap-2">
                                    {EMOJI_OPTIONS.map((emoji) => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => setSelectedEmoji(emoji)}
                                            className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg cursor-pointer transition-colors duration-200 border ${selectedEmoji === emoji
                                                ? "border-purple-500 bg-purple-500/20"
                                                : "border-transparent bg-white/5 hover:bg-white/10"
                                                }`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <p className="text-red-400 text-sm font-body mb-4">{error}</p>
                            )}

                            {/* Save button */}
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full py-3.5 text-sm font-body font-medium text-white bg-[#7C3AED] rounded-lg
                           hover:bg-[#A855F7] transition-all duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Add Habit
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
                                    </>
                                )}
                            </button>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
