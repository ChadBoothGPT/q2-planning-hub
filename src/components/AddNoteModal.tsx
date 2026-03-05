'use client';

import { useState } from 'react';

interface AddNoteModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (content: string, category: 'action-item' | 'decision' | 'parking-lot') => void;
}

export default function AddNoteModal({ open, onClose, onSave }: AddNoteModalProps) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'action-item' | 'decision' | 'parking-lot'>('action-item');

  if (!open) return null;

  function handleSave() {
    if (!content.trim()) return;
    onSave(content.trim(), category);
    setContent('');
    setCategory('action-item');
    onClose();
  }

  const categories = [
    { value: 'action-item' as const, label: 'Action Item', color: 'bg-blue-500' },
    { value: 'decision' as const, label: 'Decision', color: 'bg-green-500' },
    { value: 'parking-lot' as const, label: 'Parking Lot', color: 'bg-gray-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Add Meeting Note</h3>

        <div className="flex gap-2 mb-4">
          {categories.map(c => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                category === c.value
                  ? `${c.color} text-white`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Type your note..."
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0B4B3B] focus:border-transparent outline-none resize-none"
          autoFocus
        />

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!content.trim()}
            className="px-4 py-2 bg-[#0B4B3B] text-white text-sm font-medium rounded-lg hover:bg-[#0d6b54] transition disabled:opacity-50"
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
}
