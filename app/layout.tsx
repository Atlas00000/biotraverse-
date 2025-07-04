import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BioTraverse - Wildlife Migration Tracker',
  description: 'Interactive wildlife migration tracking and visualization platform. Explore real-time migration patterns of birds, marine life, insects, and mammals with our advanced mapping technology.',
  keywords: 'wildlife, migration, tracking, animals, birds, marine life, conservation, mapping, visualization',
  authors: [{ name: 'BioTraverse Team' }],
  creator: 'BioTraverse',
  publisher: 'BioTraverse',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'BioTraverse - Wildlife Migration Tracker',
    description: 'Interactive wildlife migration tracking and visualization platform',
    type: 'website',
    locale: 'en_US',
    siteName: 'BioTraverse',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BioTraverse - Wildlife Migration Tracker',
    description: 'Interactive wildlife migration tracking and visualization platform',
  },
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
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
