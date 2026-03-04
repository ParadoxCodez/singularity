import type { Metadata } from "next";
import "./globals.css";
import NavigationProgress from "@/components/NavigationProgress";
import { Analytics } from '@vercel/analytics/next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://singularity.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Singularity — Build Habits That Define You',
    template: '%s | Singularity',
  },
  description: 'Singularity is your personal growth OS. Track daily habits, write your story, manage your spending, and visualize your progress — all in one focused app.',
  keywords: [
    'habit tracker',
    'personal growth',
    'daily habits',
    'journal app',
    'spending tracker',
    'productivity app',
    'streak tracker',
    'self improvement',
    'habit building',
    'analytics dashboard',
  ],
  authors: [{ name: 'Singularity' }],
  creator: 'Singularity',
  publisher: 'Singularity',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Singularity',
    title: 'Singularity — Build Habits That Define You',
    description: 'Your personal growth OS. Track habits, journal daily, manage spending, and see your progress — all in one place.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Singularity — Personal Growth OS',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Singularity — Build Habits That Define You',
    description: 'Your personal growth OS. Track habits, journal daily, manage spending, and see your progress.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icon-192.png' }],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: '#7C3AED',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Singularity',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Singularity" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <link rel="shortcut icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Singularity',
              description: 'Personal growth OS for tracking habits, journaling, managing spending, and visualizing progress.',
              url: process.env.NEXT_PUBLIC_SITE_URL || 'https://singularity.vercel.app',
              applicationCategory: 'LifestyleApplication',
              operatingSystem: 'Web, iOS, Android',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
              featureList: ['Habit Tracking', 'Daily Journal', 'Spending Tracker', 'Analytics Dashboard', 'Streak Tracking', 'PWA Support'],
            }),
          }}
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-background text-text-primary">
        <NavigationProgress />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
