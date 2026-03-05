'use client';

import { useState } from 'react';
import { UserProvider, useUser } from '@/lib/UserContext';
import NavBar from '@/components/NavBar';
import AddNoteModal from '@/components/AddNoteModal';

function InnerLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, setCurrentUser } = useUser();
  const [noteOpen, setNoteOpen] = useState(false);

  async function handleSaveNote(content: string, category: 'action-item' | 'decision' | 'parking-lot') {
    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, category, author: currentUser }),
    });
  }

  return (
    <>
      <NavBar currentUser={currentUser} onUserChange={setCurrentUser} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <button
        onClick={() => setNoteOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#0B4B3B] text-white rounded-full shadow-lg hover:bg-[#0d6b54] transition flex items-center justify-center z-40"
        title="Add meeting note"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <AddNoteModal
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        onSave={handleSaveNote}
      />
    </>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <InnerLayout>{children}</InnerLayout>
    </UserProvider>
  );
}
