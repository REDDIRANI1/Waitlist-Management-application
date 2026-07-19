import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Early Access Waitlist Manager',
  description: 'Apply for early access to the next generation waitlist management application. Beautiful, responsive, and secure.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="bg-ambient"></div>
        <Header />
        <main style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
