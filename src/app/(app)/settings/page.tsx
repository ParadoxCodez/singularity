"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from '@/lib/profile-context';

type SettingsSection = 'profile' | 'account' | 'preferences' | 'about';

interface CurrencyPref {
    code: string;
    symbol: string;
    label: string;
}

const currencies: CurrencyPref[] = [
    { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
    { code: 'USD', symbol: '$', label: 'US Dollar' },
    { code: 'EUR', symbol: '€', label: 'Euro' },
    { code: 'GBP', symbol: '£', label: 'British Pound' },
    { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
];

export default function SettingsPage() {
    const router = useRouter();
    const supabase = createClient();
    const { refreshProfile } = useProfile();

    const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<{ full_name: string; avatar_url: string | null; preferences: { currency: string } } | null>(null);
    const [loading, setLoading] = useState(true);

    // Profile form state
    const [fullName, setFullName] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Password form state
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Preferences state
    const [currency, setCurrency] = useState('INR');
    const [isSavingPrefs, setIsSavingPrefs] = useState(false);

    // Delete account state
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    useEffect(() => {
        async function loadProfile() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                setProfile(profileData);
                setFullName(profileData?.full_name || '');
                setCurrency(profileData?.preferences?.currency || 'INR');
            }
            setLoading(false);
        }
        loadProfile();
    }, [supabase]);

    const navItems = [
        { id: 'profile', label: 'Profile', emoji: '👤' },
        { id: 'account', label: 'Account', emoji: '🔐' },
        { id: 'preferences', label: 'Preferences', emoji: '⚙️' },
        { id: 'about', label: 'About', emoji: '📋' },
    ];

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setIsSavingProfile(true);
        const { error } = await supabase
            .from('profiles')
            .update({ full_name: fullName, updated_at: new Date().toISOString() })
            .eq('id', user.id);

        if (error) setProfileMessage({ type: 'error', text: error.message });
        else {
            setProfileMessage({ type: 'success', text: 'Profile updated successfully.' });
            await refreshProfile();
        }

        setIsSavingProfile(false);
        setTimeout(() => setProfileMessage(null), 3000);
    };

    const handleSavePassword = async () => {
        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: "Passwords don't match" });
            setTimeout(() => setPasswordMessage(null), 3000);
            return;
        }
        if (newPassword.length < 8) {
            setPasswordMessage({ type: 'error', text: "Password must be at least 8 characters" });
            setTimeout(() => setPasswordMessage(null), 3000);
            return;
        }
        setIsSavingPassword(true);
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) setPasswordMessage({ type: 'error', text: error.message });
        else {
            setPasswordMessage({ type: 'success', text: 'Password updated successfully.' });
            setNewPassword('');
            setConfirmPassword('');
        }
        setIsSavingPassword(false);
        setTimeout(() => setPasswordMessage(null), 3000);
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE' || !user) return;
        setIsDeletingAccount(true);
        // Delete all user data first (RLS handles this via cascade normally, but explicit requests here)
        await supabase.from('habits').delete().eq('user_id', user.id);
        await supabase.from('journal_entries').delete().eq('user_id', user.id);
        await supabase.from('transactions').delete().eq('user_id', user.id);
        await supabase.from('profiles').delete().eq('id', user.id);
        await supabase.auth.signOut();
        router.push('/');
    };

    const handleSavePreferences = async () => {
        if (!user) return;
        setIsSavingPrefs(true);
        await supabase
            .from('profiles')
            .update({ preferences: { currency } })
            .eq('id', user.id);
        setIsSavingPrefs(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0F]">
                <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
                    <div className="mb-8">
                        <h1 className="font-display text-[32px] text-white">Settings</h1>
                        <p className="text-[#6B6B8A] font-body text-sm mt-1">Manage your account and preferences</p>
                    </div>
                    <div className="flex gap-8">
                        <div className="w-52 flex-shrink-0 hidden lg:flex flex-col gap-1">
                            <div className="h-10 bg-[#111118] rounded-lg animate-pulse mb-1"></div>
                            <div className="h-10 bg-[#111118] rounded-lg animate-pulse mb-1"></div>
                        </div>
                        <div className="flex-1 min-w-0 bg-[#111118] rounded-xl h-96 animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0F]">
            <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
                {/* Page header */}
                <div className="mb-8">
                    <h1 className="font-display text-[32px] text-white">Settings</h1>
                    <p className="text-[#6B6B8A] font-body text-sm mt-1">Manage your account and preferences</p>
                </div>

                {/* Mobile Tab Nav */}
                <div className="flex lg:hidden overflow-x-auto hide-scrollbar gap-2 mb-6 pb-2 border-b border-white/5">
                    {navItems.map((item) => {
                        const isActive = activeSection === item.id;
                        return (
                            <div
                                key={item.id}
                                onClick={() => setActiveSection(item.id as SettingsSection)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap flex-shrink-0 cursor-pointer transition-all font-body ${isActive
                                    ? 'bg-purple-500/10 text-white border border-purple-500/20'
                                    : 'text-[#6B6B8A] hover:bg-white/5 hover:text-white border border-transparent'
                                    }`}
                            >
                                <span className="text-base">{item.emoji}</span>
                                <span>{item.label}</span>
                            </div>
                        );
                    })}
                </div>

                <div className="flex gap-8">
                    {/* LEFT NAV */}
                    <div className="w-52 flex-shrink-0 hidden lg:flex flex-col gap-1">
                        {navItems.map((item) => {
                            const isActive = activeSection === item.id;
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id as SettingsSection)}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all text-sm font-body ${isActive
                                        ? 'bg-purple-500/10 text-white border border-purple-500/20'
                                        : 'text-[#6B6B8A] hover:bg-white/5 hover:text-white border border-transparent'
                                        }`}
                                >
                                    <span className="text-base">{item.emoji}</span>
                                    <span>{item.label}</span>
                                </div>
                            );
                        })}

                        {/* Sign Out Button */}
                        <div
                            onClick={handleSignOut}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all text-sm text-[#6B6B8A] hover:text-red-400 hover:bg-red-500/5 mt-4 border border-transparent font-body"
                        >
                            <span className="text-base">🚪</span>
                            <span>Sign Out</span>
                        </div>
                    </div>

                    {/* CONTENT PANEL */}
                    <div className="flex-1 min-w-0">
                        {activeSection === 'profile' && (
                            <div className="bg-[#111118] border border-white/5 rounded-xl p-6">
                                <h2 className="font-display text-xl text-white mb-1">Profile</h2>
                                <p className="text-[#6B6B8A] font-body text-sm mb-6">Update your display name and avatar.</p>
                                <div className="border-t border-white/5 mb-6"></div>

                                <div className="flex items-center gap-6 mb-6">
                                    <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-medium flex-shrink-0 overflow-hidden font-display">
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} className="w-full h-full object-cover rounded-full" alt="Avatar" />
                                        ) : (
                                            (fullName || user?.email || "?").charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-white font-body text-sm">Profile Photo</div>
                                        <button title="Photo upload coming soon" className="text-xs text-purple-400 hover:text-purple-300 cursor-pointer mt-1 border border-purple-500/20 rounded-md px-3 py-1.5 bg-purple-500/10 transition-colors font-body">
                                            Upload a photo
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-[#6B6B8A] text-xs font-body uppercase tracking-widest mb-1.5">Full Name</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                        className="w-full bg-[#0A0A0F] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all font-body"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-[#6B6B8A] text-xs font-body uppercase tracking-widest mb-1.5">Email Address</label>
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        readOnly
                                        disabled
                                        className="w-full bg-[#0A0A0F] border border-white/10 rounded-lg px-4 py-3 text-white text-sm opacity-50 cursor-not-allowed font-body"
                                    />
                                    <p className="text-[#6B6B8A] text-xs mt-1 font-body">Email cannot be changed.</p>
                                </div>

                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isSavingProfile}
                                    className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors mt-6 font-body"
                                >
                                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                                </button>

                                {profileMessage && (
                                    <div className={`text-sm mt-3 font-body ${profileMessage.type === 'success' ? 'text-green-400 flex items-center gap-2' : 'text-red-400'}`}>
                                        {profileMessage.type === 'success' && '✓'} {profileMessage.text}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeSection === 'account' && (
                            <div className="space-y-4">
                                <div className="bg-[#111118] border border-white/5 rounded-xl p-6">
                                    <h2 className="font-display text-xl text-white mb-1">Change Password</h2>
                                    <p className="text-[#6B6B8A] font-body text-sm mb-6">Choose a strong password.</p>
                                    <div className="border-t border-white/5 mb-6"></div>

                                    <div className="mb-4">
                                        <label className="block text-[#6B6B8A] text-xs font-body uppercase tracking-widest mb-1.5">New Password</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            className="w-full bg-[#0A0A0F] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all font-body"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-[#6B6B8A] text-xs font-body uppercase tracking-widest mb-1.5">Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            className="w-full bg-[#0A0A0F] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all font-body"
                                        />
                                        {(newPassword || confirmPassword) && newPassword !== confirmPassword && (
                                            <p className="text-red-400 text-xs mt-1 font-body">Passwords don&apos;t match</p>
                                        )}
                                        {newPassword && newPassword.length < 8 && (
                                            <p className="text-red-400 text-xs mt-1 font-body">Password must be at least 8 characters</p>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleSavePassword}
                                        disabled={isSavingPassword || !newPassword || newPassword !== confirmPassword || newPassword.length < 8}
                                        className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors mt-6 font-body"
                                    >
                                        {isSavingPassword ? 'Saving...' : 'Save Changes'}
                                    </button>

                                    {passwordMessage && (
                                        <div className={`text-sm mt-3 font-body ${passwordMessage.type === 'success' ? 'text-green-400 flex items-center gap-2' : 'text-red-400'}`}>
                                            {passwordMessage.type === 'success' && '✓'} {passwordMessage.text}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-[#111118] border border-red-500/20 rounded-xl p-6 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-500/60 rounded-t-xl" />
                                    <h2 className="font-display text-xl text-red-400 mb-1">Danger Zone</h2>
                                    <p className="text-[#6B6B8A] font-body text-sm mb-6">These actions are permanent and cannot be undone.</p>
                                    <div className="border-t border-red-500/10 mb-6"></div>

                                    <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-4 text-red-300 text-sm mb-4 font-body">
                                        Deleting your account will permanently remove all your habits, journal entries, spending data, and analytics. This cannot be reversed.
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-[#6B6B8A] text-xs font-body mb-1.5">Type &quot;DELETE&quot; to confirm</label>
                                        <input
                                            type="text"
                                            value={deleteConfirmText}
                                            onChange={e => setDeleteConfirmText(e.target.value)}
                                            placeholder="DELETE"
                                            className="w-full bg-[#0A0A0F] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all font-body"
                                        />
                                    </div>

                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={isDeletingAccount || deleteConfirmText !== 'DELETE'}
                                        className="w-full mt-4 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors text-sm font-body"
                                    >
                                        {isDeletingAccount ? 'Deleting...' : 'Permanently Delete Account'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeSection === 'preferences' && (
                            <div className="bg-[#111118] border border-white/5 rounded-xl p-6">
                                <h2 className="font-display text-xl text-white mb-1">Preferences</h2>
                                <p className="text-[#6B6B8A] font-body text-sm mb-6">Customize how Singularity works for you.</p>
                                <div className="border-t border-white/5 mb-6"></div>

                                <div>
                                    <label className="block text-[#6B6B8A] text-xs uppercase tracking-widest mb-2 font-body">Default Currency</label>
                                    <p className="text-[#6B6B8A] text-xs mb-3 font-body">Used across your spending tracker.</p>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {currencies.map((curr) => {
                                            const isSelected = currency === curr.code;
                                            return (
                                                <button
                                                    key={curr.code}
                                                    onClick={() => setCurrency(curr.code)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-body transition-all cursor-pointer border ${isSelected
                                                        ? 'bg-purple-500/20 border-purple-500/40 text-white'
                                                        : 'bg-white/5 border-transparent text-[#6B6B8A] hover:bg-white/8'
                                                        }`}
                                                >
                                                    {curr.symbol} {curr.code}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <button
                                    onClick={handleSavePreferences}
                                    disabled={isSavingPrefs}
                                    className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors font-body"
                                >
                                    {isSavingPrefs ? 'Saving...' : 'Save Preferences'}
                                </button>
                            </div>
                        )}

                        {activeSection === 'about' && (
                            <div className="bg-[#111118] border border-white/5 rounded-xl p-6">
                                <div className="flex flex-col items-center text-center py-8">
                                    <div className="w-20 h-20 rounded-2xl bg-purple-600 flex items-center justify-center text-white text-4xl font-bold mb-6 font-display">
                                        S
                                    </div>
                                    <h2 className="font-display text-2xl text-white">Singularity</h2>
                                    <p className="text-[#6B6B8A] font-body text-sm mt-1">Your personal growth OS.</p>
                                    <p className="text-[#6B6B8A] font-body text-xs mt-1">Version 1.0.0</p>

                                    <div className="border-t border-white/5 my-8 w-full"></div>

                                    <div className="flex gap-6 justify-center">
                                        <a href="#" className="font-body text-sm text-[#6B6B8A] hover:text-purple-400 transition-colors cursor-pointer">
                                            Privacy Policy
                                        </a>
                                        <a href="#" className="font-body text-sm text-[#6B6B8A] hover:text-purple-400 transition-colors cursor-pointer">
                                            Terms of Service
                                        </a>
                                    </div>

                                    <p className="mt-8 text-xs text-[#6B6B8A] font-body">
                                        Built for people who take growth seriously.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
