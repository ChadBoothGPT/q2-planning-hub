'use client';

import { useEffect, useState, useRef } from 'react';
import { TEAM_MEMBERS } from '@/lib/constants';

interface NamePickerProps {
  currentUser: string;
  onSelect: (name: string) => void;
}

export default function NamePicker({ currentUser, onSelect }: NamePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const member = TEAM_MEMBERS.find(m => m.name === currentUser);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-white text-sm font-medium"
      >
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: member?.color ?? '#6B7280' }}
        >
          {currentUser[0]}
        </span>
        {currentUser}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
          {TEAM_MEMBERS.map(m => (
            <button
              key={m.name}
              onClick={() => { onSelect(m.name); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition ${
                m.name === currentUser ? 'bg-gray-50 font-semibold' : 'text-gray-700'
              }`}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: m.color }}
              >
                {m.name[0]}
              </span>
              {m.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
