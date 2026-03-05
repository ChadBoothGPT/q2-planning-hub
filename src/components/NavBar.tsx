'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NamePicker from './NamePicker';

const NAV_ITEMS = [
  { href: '/review', label: 'Q1 Review' },
  { href: '/proposals', label: 'Q2 Rocks' },
  { href: '/ai-pivot', label: 'AI Pivot' },
  { href: '/summary', label: 'Summary' },
];

interface NavBarProps {
  currentUser: string;
  onUserChange: (name: string) => void;
}

export default function NavBar({ currentUser, onUserChange }: NavBarProps) {
  const pathname = usePathname();

  return (
    <nav className="bg-gradient-to-r from-[#0B4B3B] to-[#0d6b54] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/review" className="text-white font-bold text-lg tracking-tight">
              Booth Q2 Planning Hub
            </Link>
            <div className="flex gap-1">
              {NAV_ITEMS.map(item => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      active
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <NamePicker currentUser={currentUser} onSelect={onUserChange} />
        </div>
      </div>
    </nav>
  );
}
