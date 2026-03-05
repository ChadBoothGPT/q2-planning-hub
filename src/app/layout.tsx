import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from './ClientLayout';

export const metadata: Metadata = {
  title: 'Booth Q2 Planning Hub',
  description: 'Q2 2026 quarterly planning session for Booth & Partners GloCom team',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#f8faf9] antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
