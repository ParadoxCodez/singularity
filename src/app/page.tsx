"use client";

import { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import Link from "next/link";

/* ─── Constants ─── */
const CYCLING_WORDS = ["habits", "streaks", "discipline", "focus", "growth"];
const CYCLE_INTERVAL = 2500;

const MARQUEE_ITEMS = [
  "HABIT TRACKING",
  "DAILY STREAKS",
  "JOURNAL",
  "SPENDING TRACKER",
  "ANALYTICS",
  "SINGULARITY",
  "BUILD IN PUBLIC",
  "GROW DAILY",
];

const FEATURES = [
  {
    num: "01",
    name: "Habit Tracking",
    desc: "Build daily rituals with streaks, check-ins, and monthly progress grids.",
    icon: "✅",
  },
  {
    num: "02",
    name: "Daily Journal",
    desc: "Write your thoughts, wins and reflections. Search and revisit past entries anytime.",
    icon: "📓",
  },
  {
    num: "03",
    name: "Spending Tracker",
    desc: "Log expenses by category and see where your money actually goes each month.",
    icon: "💸",
  },
  {
    num: "04",
    name: "Analytics",
    desc: "Visualize habit consistency with heatmaps, streak history, and trend charts.",
    icon: "📊",
  },
];

const HEATMAP_GRID = [
  1, 1, 0, 1, 1, 1, 0,
  1, 0, 1, 1, 1, 0, 1,
  1, 1, 1, 0, 1, 1, 1,
  0, 1, 1, 1, 0, 1, 1,
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Create your account",
    desc: "Sign up in seconds. No credit card, no setup friction.",
  },
  {
    step: "2",
    title: "Add your habits",
    desc: "Name your habits, pick an icon, set your frequency.",
  },
  {
    step: "3",
    title: "Track and grow",
    desc: "Check in daily, watch your streaks build, review your analytics.",
  },
];

const TESTIMONIALS = [
  {
    quote: '"I\'ve tried 6 habit apps. Singularity is the only one I kept using past week one."',
    name: "Alex R.",
    role: "Software Engineer",
  },
  {
    quote: '"The journal + habit combo changed how I reflect on my days. Everything in one place."',
    name: "Priya S.",
    role: "Designer",
  },
  {
    quote: '"Clean, fast, distraction-free. Exactly what I needed."',
    name: "Marcus T.",
    role: "Student",
  },
];

const ease = [0.25, 0.46, 0.45, 0.94] as const;

/* ─── Page ─── */
export default function Home() {
  const [wordIndex, setWordIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % CYCLING_WORDS.length);
    }, CYCLE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  /* ── Marquee text (duplicated for seamless loop) ── */
  const marqueeContent = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <>
      {/* ════════════════ NAVBAR ════════════════ */}
      <nav
        id="navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-16 flex items-center ${scrolled
          ? 'bg-[#0A0A0F]/95 backdrop-blur-md border-b border-white/6'
          : 'bg-transparent border-b border-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span
              className="text-white font-semibold tracking-[0.15em] text-sm"
              style={{ fontFamily: 'Clash Display' }}
            >
              SINGULARITY
            </span>
          </Link>

          <div className="flex items-center gap-5 z-10">
            <Link
              href="/auth"
              onMouseEnter={() => setHoveredNav('signin')}
              onMouseLeave={() => setHoveredNav(null)}
              className="relative px-4 py-2 text-sm"
            >
              {hoveredNav === 'signin' && (
                <motion.div
                  layoutId="landingNavHighlight"
                  className="absolute inset-0 rounded-md bg-white/5 border border-white/8"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className={`relative z-10 transition-colors duration-150 text-sm ${hoveredNav === 'signin' ? 'text-white' : 'text-[#6B6B8A]'}`}
                style={{ fontFamily: 'Satoshi' }}>
                Sign In
              </span>
            </Link>
            <Link
              href="/auth"
              className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-[0_0_24px_rgba(124,58,237,0.4)]"
              style={{ fontFamily: 'Satoshi' }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* ════════════════ HERO ════════════════ */}
        <section
          id="hero"
          className="relative flex flex-col items-center justify-center text-center min-h-screen px-6 py-32 lg:py-40 overflow-hidden"
        >
          {/* Radial glow — background layer */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(124,58,237,0.08) 0%, transparent 60%)",
            }}
          />

          {/* Decorative pulsing orbs */}
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full pointer-events-none z-0 animate-pulse-slow"
            style={{
              background:
                "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute top-[40%] left-[55%] w-[300px] h-[300px] rounded-full pointer-events-none z-0 animate-pulse-slower"
            style={{
              background:
                "radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)",
            }}
          />

          {/* Eyebrow pill */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="relative z-10"
          >
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 text-primary-light px-3 py-1 text-xs font-body tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block mr-2 animate-blink-dot" />
              Personal Growth OS
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.15 }}
            className="relative z-10 mt-8 font-display font-bold text-white leading-none
                       text-[48px] sm:text-[72px] md:text-[100px] lg:text-[140px]"
          >
            Build the
            <br />
            <span className="inline-block relative h-[1.1em] overflow-hidden align-bottom">
              <AnimatePresence mode="wait">
                <motion.span
                  key={CYCLING_WORDS[wordIndex]}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 0.5, ease }}
                  className="inline-block text-purple-400 italic"
                >
                  {CYCLING_WORDS[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
            <br />
            that define you.
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.3 }}
            className="relative z-10 mt-8 max-w-lg font-body text-text-muted text-base sm:text-lg leading-relaxed"
          >
            Track daily habits, write your story, and manage your spending —
            one focused app for people serious about growth.
          </motion.p>

          {/* CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.45 }}
            className="relative z-10 mt-10 flex flex-col sm:flex-row items-center gap-4"
          >
            <Link
              href="/auth"
              id="hero-cta-primary"
              className="px-6 py-3 text-base font-body font-medium text-white bg-primary rounded-lg
                         hover:bg-primary-light transition-colors duration-200"
            >
              Start for free →
            </Link>
            <a
              href="#features"
              className="flex items-center gap-1 text-base font-body text-text-muted
                         hover:text-white transition-colors duration-200"
            >
              See it in action
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="mt-0.5"
              >
                <path
                  d="M3 8h10m0 0L9 4m4 4L9 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </motion.div>
        </section>

        {/* ════════════════ MARQUEE TICKER ════════════════ */}
        <section
          id="marquee"
          className="overflow-hidden bg-surface border-y border-border py-5"
        >
          <div className="animate-marquee flex w-max items-center gap-0">
            {marqueeContent.map((item, i) => (
              <span key={i} className="flex items-center whitespace-nowrap">
                <span className="font-display text-sm uppercase tracking-widest text-text-muted">
                  {item}
                </span>
                <span className="mx-4 text-primary-light text-sm">·</span>
              </span>
            ))}
          </div>
        </section>

        {/* ════════════════ FEATURES ════════════════ */}
        <section id="features" className="px-6 py-24 lg:py-32 border-t border-white/5" style={{ backgroundColor: '#0A0A0F' }}>
          <div className="max-w-7xl mx-auto">
            <p className="text-xs font-body uppercase tracking-widest text-text-muted mb-4">
              WHAT&apos;S INSIDE
            </p>
            <h2 className="font-display font-bold text-white leading-tight mb-16
                         text-[40px] sm:text-[56px] lg:text-[72px]">
              Everything you need.
            </h2>

            <div>
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.num}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease, delay: i * 0.1 }}
                  className="flex items-center border-b border-border py-10 gap-6 sm:gap-10"
                >
                  {/* Number */}
                  <span className="hidden sm:block font-display text-[64px] lg:text-[80px] leading-none
                                text-white opacity-[0.06] select-none shrink-0 w-28 lg:w-36">
                    {f.num}
                  </span>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-white text-xl sm:text-2xl lg:text-[32px] leading-tight">
                      {f.name}
                    </h3>
                    <p className="mt-2 font-body text-text-muted text-sm sm:text-[15px] leading-relaxed max-w-[400px]">
                      {f.desc}
                    </p>
                  </div>

                  {/* Icon */}
                  <span className="text-[36px] sm:text-[48px] shrink-0">
                    {f.icon}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════ HOW IT WORKS ════════════════ */}
        <section id="how-it-works" className="px-6 py-24 lg:py-32 border-t border-b border-white/5" style={{ backgroundColor: '#0D0D15' }}>
          <div className="max-w-7xl mx-auto">
            <p className="text-xs font-body uppercase tracking-widest text-text-muted mb-4">
              HOW IT WORKS
            </p>
            <h2 className="font-display font-bold text-white leading-tight mb-20
                         text-[36px] sm:text-[48px] lg:text-[56px]">
              Up and running in minutes.
            </h2>

            <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
              {/* Left column — steps (55%) */}
              <div className="lg:w-[55%]">
                {HOW_IT_WORKS.map((s, i) => (
                  <motion.div
                    key={s.step}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease, delay: i * 0.15 }}
                    className="relative flex items-start gap-4 mb-10 last:mb-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 text-primary-light text-sm
                                  flex items-center justify-center font-medium shrink-0">
                      {s.step}
                    </div>
                    <div>
                      <h3 className="font-body font-medium text-white text-lg mb-2">
                        {s.title}
                      </h3>
                      <p className="font-body text-text-muted text-sm leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Right column — image (45%) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease }}
                className="lg:w-[45%]"
              >
                <div className="relative rounded-2xl overflow-hidden border border-white/8 h-[400px] lg:h-[480px]">
                  <img
                    src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=80"
                    alt="Person journaling and planning"
                    className="w-full h-full object-cover object-center absolute inset-0"
                  />
                  {/* Fade overlay into section bg */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D15] via-[#0D0D15]/30 to-transparent" />
                  {/* Color tint overlay */}
                  <div className="absolute inset-0 bg-purple-950/30 mix-blend-multiply" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ════════════════ PRODUCT PREVIEW ════════════════ */}
        <section
          id="product-preview"
          className="px-6 py-24 lg:py-32" style={{ backgroundColor: '#0A0A0F' }}
        >
          {/* Decorative purple gradient line */}
          <div className="h-px w-full" style={{ background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.5), transparent)' }} />
          <div className="max-w-7xl mx-auto pt-[120px]">
            <p className="text-xs font-body uppercase tracking-widest text-text-muted text-center mb-4">
              THE APP
            </p>
            <h2 className="font-display font-bold text-white text-center leading-tight max-w-2xl mx-auto mb-16
                         text-[32px] sm:text-[44px] lg:text-[56px]">
              Your command center for growth.
            </h2>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative"
            >
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
              {/* Browser bar */}
              <div className="bg-surface-2 h-10 flex items-center px-4 gap-2">
                <span className="w-3 h-3 rounded-full bg-danger" />
                <span className="w-3 h-3 rounded-full bg-[#FBBF24]" />
                <span className="w-3 h-3 rounded-full bg-success" />
                <span className="mx-auto rounded-md bg-white/5 text-text-muted text-xs px-3 py-1 w-48 text-center">
                  singularity.app/habits
                </span>
              </div>

              {/* App preview content — two-panel dashboard */}
              <div className="bg-surface h-[400px] p-5 overflow-hidden">
                <div className="flex h-full gap-5">
                  {/* Left panel — habit list (60%) */}
                  <div className="w-[60%] flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-body font-medium text-white text-sm">
                        My Habits
                      </span>
                      <span className="text-xs font-body text-text-muted">
                        Feb 2026
                      </span>
                    </div>

                    <div className="flex-1 overflow-hidden">
                      {[
                        { name: "Morning Workout", streak: 18, done: true },
                        { name: "Read 30 mins", streak: 12, done: true },
                        { name: "No sugar", streak: 7, done: true },
                        { name: "Journal entry", streak: 5, done: false },
                        { name: "Meditate 10 min", streak: 3, done: false },
                      ].map((h) => (
                        <div
                          key={h.name}
                          className="flex items-center gap-3 py-3 border-b border-white/5"
                        >
                          <div
                            className={`w-5 h-5 rounded border flex items-center justify-center text-[10px] shrink-0
                            ${h.done
                                ? "bg-primary border-primary text-white"
                                : "border-primary/40 text-transparent"
                              }`}
                          >
                            {h.done ? "✓" : ""}
                          </div>
                          <span
                            className={`font-body text-[13px] flex-1 ${h.done ? "text-white" : "text-text-muted"
                              }`}
                          >
                            {h.name}
                          </span>
                          <span className="font-body text-xs text-orange-400 font-medium">
                            🔥 {h.streak}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right panel — heatmap (40%) */}
                  <div className="w-[40%] flex flex-col border-l border-white/5 pl-5">
                    <span className="font-body text-text-muted text-xs mb-4">
                      This Month
                    </span>
                    <div className="grid grid-cols-7 gap-1.5">
                      {HEATMAP_GRID.map((filled, i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 rounded-sm ${filled ? "bg-primary" : "bg-white/5"
                            }`}
                        />
                      ))}
                    </div>
                    <span className="font-body text-primary-light text-sm mt-4">
                      68% completion
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ════════════════ TESTIMONIALS ════════════════ */}
        <section
          id="testimonials"
          className="px-6 py-20 lg:py-28" style={{ backgroundColor: '#0D0D15' }}
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl lg:text-4xl text-white text-center mb-12">
              Loved by early users
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => {
                const colors: Record<string, string> = {
                  "Alex R.": "bg-blue-600",
                  "Priya S.": "bg-purple-600",
                  "Marcus T.": "bg-green-600",
                };
                return (
                  <motion.div
                    key={t.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease, delay: i * 0.1 }}
                    className="bg-[#111118] border border-white/8 rounded-2xl p-6 flex flex-col gap-4 hover:border-white/12 transition-all duration-200"
                  >
                    {/* Stars */}
                    <p className="text-yellow-400 text-base tracking-wide">★★★★★</p>
                    {/* Quote */}
                    <p className="text-[#C4C4D4] text-sm leading-relaxed italic" style={{ fontFamily: 'Satoshi' }}>
                      {t.quote}
                    </p>
                    {/* Author */}
                    <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0 ${colors[t.name] || 'bg-gray-600'}`}>
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium" style={{ fontFamily: 'Satoshi' }}>{t.name}</p>
                        <p className="text-[#6B6B8A] text-xs" style={{ fontFamily: 'Satoshi' }}>{t.role}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ════════════════ FINAL CTA ════════════════ */}
        <section
          id="cta"
          className="relative overflow-hidden px-6 py-32 lg:py-40 flex flex-col items-center text-center" style={{ backgroundColor: '#0F0F1A' }}
        >
          {/* Full-bleed background image */}
          <img
            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=85"
            alt="Person at desk, productive"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-[0.06]"
          />
          {/* Gradient overlay on top of image */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F0F1A] via-[#0F0F1A]/90 to-[#0F0F1A]" />

          {/* Decorative purple gradient line at top */}
          <div className="absolute top-0 left-0 right-0 h-px z-10" style={{ background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.5), transparent)' }} />
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="relative z-10 font-display font-bold text-white leading-none
                       text-[48px] sm:text-[72px] lg:text-[100px]"
          >
            Ready to start?
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease, delay: 0.15 }}
            className="relative z-10 mt-10 flex flex-col items-center gap-4"
          >
            <Link
              href="/auth"
              id="cta-btn"
              className="px-8 py-4 text-lg font-body font-medium text-white bg-primary rounded-lg
                         hover:bg-primary-light transition-colors duration-200"
            >
              Get Started Free →
            </Link>
            <p className="font-body text-sm text-text-muted">
              No credit card required · Works on any device
            </p>
          </motion.div>
        </section>
      </main>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer
        id="footer"
        className="border-t border-white/5 py-6 px-8" style={{ backgroundColor: '#0A0A0F' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="text-[#6B6B8A] tracking-widest text-xs" style={{ fontFamily: 'Clash Display' }}>
            SINGULARITY
          </span>
          <span className="text-[#6B6B8A] text-xs" style={{ fontFamily: 'Satoshi' }}>
            © 2026 Singularity. All rights reserved.
          </span>
        </div>
      </footer>
    </>
  );
}
