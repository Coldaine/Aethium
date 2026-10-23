import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aetherial — Spatial Task & Information Canvas',
  description: 'An adaptive 3D spatial information substrate and physics sandbox featuring faceted polyhedra bubbles, passing trains, kinetic typography, and mechanical contraption widgets powered by Gemini and Google Workspace.',
  openGraph: {
    title: 'Aetherial — Spatial Task & Information Canvas',
    description: 'An adaptive 3D spatial information substrate and physics sandbox featuring faceted polyhedra bubbles, passing trains, kinetic typography, and mechanical contraption widgets powered by Gemini and Google Workspace.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aetherial — Spatial Task & Information Canvas',
    description: 'An adaptive 3D spatial information substrate and physics sandbox featuring faceted polyhedra bubbles, passing trains, kinetic typography, and mechanical contraption widgets powered by Gemini and Google Workspace.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning className="font-sans antialiased bg-[#07090e] text-slate-100 min-h-screen w-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
