# SINGULARITY — Personal Growth OS

<div align="center">

![Singularity Banner](public/og-image.png)

**Build the habits that define you.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-singularity--blue.vercel.app-7C3AED?style=for-the-badge&logo=vercel)](https://singularity-blue.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![PWA](https://img.shields.io/badge/PWA-Ready-7C3AED?style=for-the-badge)](https://web.dev/progressive-web-apps/)

</div>

---

## Overview

Singularity is a full-stack personal growth web application built for people who take self-improvement seriously. It combines four core pillars of personal development — habit tracking, daily journaling, spending management, and analytics — into a single, focused product with a premium dark UI.

Built as a Progressive Web App (PWA), Singularity works seamlessly on desktop and mobile, and can be installed directly to your home screen.

---

## Features

### Habit Tracker
- Create unlimited daily habits with custom emoji icons
- Check off habits each day with instant optimistic UI updates
- Track streaks per habit with fire emoji indicators
- Monthly overview calendar grid showing completion history
- Sidebar with per-habit completion percentages and streak data
- Today's Progress card showing real-time completion ratio
- Archive and delete habits with confirmation
- Rename existing habits inline

### Daily Journal
- Write daily entries with a rich text editor
- Select from 5 mood indicators (emoji-based)
- Structured prompts: Grateful for, Accomplished, Tomorrow's focus, Free write
- Streak tracking for consecutive journaling days
- Browse and read past entries from a sidebar calendar

### Spending Tracker
- Log expenses with amount, category, note, and date
- 8 categories: Food, Transport, Shopping, Health, Entertainment, Education, Housing, Other
- Monthly summary with total spend
- Bar chart breakdown by category using Recharts
- Recent transactions list with inline delete confirmation
- Persistent data across sessions via Supabase

### Analytics Dashboard
- 90-day habit activity heatmap (always full, never empty)
- Line and bar charts for habit completion trends
- Per-habit performance cards with completion rates
- Milestone achievement system with 8 unlockable badges
- Spending summary integrated into analytics view

### Settings
- Update display name (reflects instantly across entire app via React Context)
- Change currency preference
- Account management
- Appearance preferences

### Authentication
- Email/password sign up and sign in
- Forgot password flow with email reset link
- Supabase-powered secure authentication
- Protected routes via Next.js middleware

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Charts | Recharts |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Deployment | Vercel |
| PWA | next-pwa |
| Fonts | Clash Display, Satoshi |

---

## Project Structure

```
singularity/
├── public/
│   ├── icon-192.png          # PWA icon
│   ├── icon-512.png          # PWA icon (maskable)
│   ├── manifest.json         # PWA manifest
│   ├── og-image.png          # Open Graph image
│   └── sw.js                 # Service worker
│
├── src/
│   ├── app/
│   │   ├── (app)/            # Protected app routes
│   │   │   ├── habits/       # Habit tracker page
│   │   │   ├── journal/      # Journal page
│   │   │   ├── spending/     # Spending tracker page
│   │   │   ├── analytics/    # Analytics dashboard
│   │   │   ├── settings/     # Settings page
│   │   │   └── layout.tsx    # App layout with navbar
│   │   ├── auth/
│   │   │   ├── page.tsx              # Sign in / Sign up
│   │   │   ├── forgot-password/      # Password reset request
│   │   │   └── update-password/      # New password form
│   │   ├── og/               # Dynamic OG image generation
│   │   ├── layout.tsx        # Root layout with metadata
│   │   ├── page.tsx          # Landing page
│   │   ├── robots.ts         # SEO robots config
│   │   └── sitemap.ts        # SEO sitemap
│   │
│   ├── components/
│   │   ├── AppNavbar.tsx     # Internal app navigation
│   │   ├── MobileNav.tsx     # Bottom navigation for mobile
│   │   └── NavigationProgress.tsx  # Route transition indicator
│   │
│   └── lib/
│       ├── supabase.ts       # Supabase client
│       └── profile-context.tsx  # Global profile state
```

---

## Database Schema

### `profiles`
| Column | Type | Description |
|---|---|---|
| id | uuid | References auth.users |
| full_name | text | Display name |
| avatar_url | text | Profile picture URL |
| preferences | jsonb | User preferences (currency etc) |
| updated_at | timestamptz | Last updated |

### `habits`
| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | References auth.users |
| name | text | Habit name |
| icon | text | Emoji icon |
| color | text | Accent color |
| frequency | text | daily / weekly |
| is_archived | boolean | Soft delete flag |
| created_at | timestamptz | Creation timestamp |

### `habit_logs`
| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| habit_id | uuid | References habits |
| user_id | uuid | References auth.users |
| completed_date | date | Date of completion |
| completed | boolean | Completion status |
| created_at | timestamptz | Creation timestamp |

### `journal_entries`
| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | References auth.users |
| entry_date | date | Journal date |
| content | jsonb | Structured entry content |
| mood | text | Selected mood |
| updated_at | timestamptz | Last modified |

### `transactions`
| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | References auth.users |
| amount | numeric | Transaction amount |
| category | text | Expense category |
| note | text | Optional description |
| transaction_date | date | Date of transaction |
| type | text | expense / income |
| created_at | timestamptz | Creation timestamp |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- A Supabase account and project

### 1. Clone the repository

```bash
git clone https://github.com/ParadoxCodez/singularity.git
cd singularity
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Set up Supabase

Run the following SQL in your Supabase SQL Editor to create all required tables and RLS policies:

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Habit logs policies
CREATE POLICY "Users can view their own habit logs"
ON habit_logs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habit logs"
ON habit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habit logs"
ON habit_logs FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habit logs"
ON habit_logs FOR DELETE USING (auth.uid() = user_id);

-- Unique constraint for habit logs upsert
ALTER TABLE habit_logs
ADD CONSTRAINT habit_logs_habit_id_completed_date_user_id_key
UNIQUE (habit_id, completed_date, user_id);

-- Transactions policies
CREATE POLICY "Users can view their own transactions"
ON transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
ON transactions FOR DELETE USING (auth.uid() = user_id);
```

### 5. Configure Supabase Auth

In your Supabase Dashboard:
- Go to **Authentication → URL Configuration**
- Set **Site URL** to your domain
- Add to **Redirect URLs**: `https://yourdomain.com/auth/update-password`

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your repository
3. Add these environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (your Vercel URL)
4. Click Deploy

Vercel will automatically redeploy on every push to `main`.

---

## PWA Installation

Singularity is a fully installable Progressive Web App.

**On Android:**
Open the site in Chrome → tap the three dots menu → "Add to Home Screen"

**On iOS:**
Open the site in Safari → tap the Share button → "Add to Home Screen"

**On Desktop:**
Look for the install icon in the browser address bar → click Install

---

## SEO

The app includes full SEO configuration:
- Dynamic Open Graph image via `/og` route
- `sitemap.xml` auto-generated via Next.js
- `robots.txt` configured to index landing page, block authenticated pages
- JSON-LD structured data for WebApplication schema
- Complete metadata including Twitter card support

---

## Performance

- **Optimistic UI updates** — habit toggles and deletions reflect instantly without waiting for server
- **Route prefetching** — Next.js prefetches all internal routes automatically
- **Loading skeletons** — each page has a `loading.tsx` skeleton that renders instantly on navigation
- **Navigation progress bar** — purple progress indicator during route transitions
- **Single Supabase client** — shared via `useMemo` to prevent lock conflicts

---

## Design System

| Token | Value |
|---|---|
| Background | `#0A0A0F` |
| Card | `#111118` |
| Purple accent | `#7C3AED` |
| Muted text | `#6B6B8A` |
| Heading font | Clash Display |
| Body font | Satoshi |
| Border radius | `rounded-xl` / `rounded-2xl` |
| Border | `border-white/5` to `border-white/10` |

---

## Roadmap

- [ ] Google OAuth sign in
- [ ] Habit reminders / push notifications
- [ ] Weekly and monthly habit frequency options
- [ ] Export data as CSV
- [ ] Income tracking alongside expenses
- [ ] Dark / light theme toggle
- [ ] Multiple users / family sharing
- [ ] Native mobile app (React Native)

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## Author

**ParadoxCodez**

Built with focus, consistency, and the belief that small daily actions compound into extraordinary results.

> *"The person you'll be in 5 years is built by the habits you start today."*
> — Singularity

---

<div align="center">
  <strong>SINGULARITY</strong> — Personal Growth OS<br/>
  <a href="https://singularity-blue.vercel.app">singularity-blue.vercel.app</a>
</div>
