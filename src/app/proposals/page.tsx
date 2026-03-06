'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/lib/UserContext';
import { STRATEGIC_PILLARS, TEAM_MEMBERS, getMemberColor } from '@/lib/constants';
import { RockProposal } from '@/lib/types';
import PillarBadge from '@/components/PillarBadge';

const ALL_MEMBERS = TEAM_MEMBERS;

interface EditForm {
  name: string;
  pillar: string;
  owner: string;
  definition_of_done: string;
  milestones: string[];
}

export default function ProposalsPage() {
  const { currentUser } = useUser();
  const [proposals, setProposals] = useState<RockProposal[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [form, setForm] = useState({
    name: '',
    pillar: '',
    owner: '',
    definition_of_done: '',
    milestones: ['', ''],
  });

  const fetchProposals = useCallback(async () => {
    const res = await fetch('/api/proposals');
    setProposals(await res.json());
  }, []);

  useEffect(() => { fetchProposals(); }, [fetchProposals]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.pillar || !form.owner) return;
    await fetch('/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        milestones: form.milestones.filter(m => m.trim()),
        proposed_by: currentUser,
        source: 'new',
      }),
    });
    setForm({ name: '', pillar: '', owner: '', definition_of_done: '', milestones: ['', ''] });
    fetchProposals();
  }

  async function updateStatus(id: string, status: RockProposal['status']) {
    await fetch('/api/proposals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    setProposals(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  }

  function startEditing(proposal: RockProposal) {
    setEditingId(proposal.id);
    setEditForm({
      name: proposal.name,
      pillar: proposal.pillar,
      owner: proposal.owner,
      definition_of_done: proposal.definition_of_done,
      milestones: proposal.milestones.length > 0 ? [...proposal.milestones] : [''],
    });
  }

  function cancelEditing() {
    setEditingId(null);
    setEditForm(null);
  }

  async function deleteProposal(id: string) {
    if (!confirm('Delete this proposal? This cannot be undone.')) return;
    await fetch(`/api/proposals?id=${id}`, { method: 'DELETE' });
    setEditingId(null);
    setEditForm(null);
    fetchProposals();
  }

  async function saveEdit() {
    if (!editingId || !editForm || !editForm.name || !editForm.pillar || !editForm.owner) return;
    await fetch('/api/proposals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingId,
        name: editForm.name,
        pillar: editForm.pillar,
        owner: editForm.owner,
        definition_of_done: editForm.definition_of_done,
        milestones: editForm.milestones.filter(m => m.trim()),
      }),
    });
    setEditingId(null);
    setEditForm(null);
    fetchProposals();
  }

  function addMilestone() {
    if (form.milestones.length < 3) {
      setForm(f => ({ ...f, milestones: [...f.milestones, ''] }));
    }
  }

  function removeMilestone(idx: number) {
    setForm(f => ({ ...f, milestones: f.milestones.filter((_, i) => i !== idx) }));
  }

  function updateMilestone(idx: number, value: string) {
    setForm(f => ({ ...f, milestones: f.milestones.map((m, i) => i === idx ? value : m) }));
  }

  // Edit form milestone helpers
  function addEditMilestone() {
    if (editForm && editForm.milestones.length < 3) {
      setEditForm({ ...editForm, milestones: [...editForm.milestones, ''] });
    }
  }

  function removeEditMilestone(idx: number) {
    if (editForm) {
      setEditForm({ ...editForm, milestones: editForm.milestones.filter((_, i) => i !== idx) });
    }
  }

  function updateEditMilestone(idx: number, value: string) {
    if (editForm) {
      setEditForm({ ...editForm, milestones: editForm.milestones.map((m, i) => i === idx ? value : m) });
    }
  }

  // Group proposals by pillar
  const groupedProposals = STRATEGIC_PILLARS.map(pillar => ({
    pillar,
    proposals: proposals.filter(p => p.pillar === pillar.id),
  })).filter(g => g.proposals.length > 0);

  // Pillar summary counts
  const pillarCounts = STRATEGIC_PILLARS.map(p => ({
    ...p,
    count: proposals.filter(pr => pr.pillar === p.id).length,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Q2 Rock Proposals</h1>

      {/* Pillar Summary */}
      <div className="flex flex-wrap gap-3 mb-8">
        {pillarCounts.map(p => (
          <div
            key={p.id}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: p.bgColor, color: p.color }}
          >
            {p.icon} {p.name}: {p.count} rock{p.count !== 1 ? 's' : ''}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Panel: Proposal Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4">New Proposal</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rock Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g., Launch BoothAgent v2"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0B4B3B] focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Strategic Pillar</label>
                <select
                  value={form.pillar}
                  onChange={e => setForm(f => ({ ...f, pillar: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0B4B3B] focus:border-transparent outline-none"
                  required
                >
                  <option value="">Select pillar...</option>
                  {STRATEGIC_PILLARS.map(p => (
                    <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                <select
                  value={form.owner}
                  onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0B4B3B] focus:border-transparent outline-none"
                  required
                >
                  <option value="">Select owner...</option>
                  {ALL_MEMBERS.map(m => (
                    <option key={m.name} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Definition of Done</label>
                <textarea
                  value={form.definition_of_done}
                  onChange={e => setForm(f => ({ ...f, definition_of_done: e.target.value }))}
                  placeholder="Clear success criteria (1-2 sentences)"
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0B4B3B] focus:border-transparent outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key Milestones ({form.milestones.length}/3)
                </label>
                {form.milestones.map((m, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      value={m}
                      onChange={e => updateMilestone(i, e.target.value)}
                      placeholder={`Milestone ${i + 1}`}
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#0B4B3B] focus:border-transparent outline-none"
                    />
                    {form.milestones.length > 1 && (
                      <button type="button" onClick={() => removeMilestone(i)} className="text-gray-400 hover:text-red-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                {form.milestones.length < 3 && (
                  <button type="button" onClick={addMilestone} className="text-sm text-[#0B4B3B] font-medium hover:underline">
                    + Add milestone
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-[#0B4B3B] text-white py-2.5 rounded-xl font-medium hover:bg-[#0d6b54] transition"
              >
                Submit Proposal
              </button>
            </form>
          </div>
        </div>

        {/* Right Panel: All Proposals */}
        <div className="lg:col-span-3 space-y-6">
          {groupedProposals.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
              No proposals yet. Be the first to submit one!
            </div>
          )}

          {groupedProposals.map(({ pillar, proposals: grouped }) => (
            <div key={pillar.id}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{pillar.icon}</span>
                <h3 className="font-bold text-gray-900">{pillar.name}</h3>
                <span className="text-sm text-gray-500">({grouped.length} rock{grouped.length !== 1 ? 's' : ''})</span>
              </div>
              <div className="space-y-3">
                {grouped.map(proposal => {
                  const isEditing = editingId === proposal.id;

                  if (isEditing && editForm) {
                    return (
                      <div key={proposal.id} className="bg-white rounded-2xl shadow-sm border-2 border-[#0B4B3B] p-5">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-semibold text-[#0B4B3B] uppercase tracking-wider">Editing Proposal</span>
                          <button onClick={cancelEditing} className="text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="space-y-3">
                          <input
                            value={editForm.name}
                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                            placeholder="Rock name"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-[#0B4B3B] focus:border-transparent outline-none"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <select
                              value={editForm.pillar}
                              onChange={e => setEditForm({ ...editForm, pillar: e.target.value })}
                              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0B4B3B] focus:border-transparent outline-none"
                            >
                              {STRATEGIC_PILLARS.map(p => (
                                <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                              ))}
                            </select>
                            <select
                              value={editForm.owner}
                              onChange={e => setEditForm({ ...editForm, owner: e.target.value })}
                              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0B4B3B] focus:border-transparent outline-none"
                            >
                              {ALL_MEMBERS.map(m => (
                                <option key={m.name} value={m.name}>{m.name}</option>
                              ))}
                            </select>
                          </div>
                          <textarea
                            value={editForm.definition_of_done}
                            onChange={e => setEditForm({ ...editForm, definition_of_done: e.target.value })}
                            placeholder="Definition of done"
                            rows={2}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0B4B3B] focus:border-transparent outline-none resize-none"
                          />
                          <div>
                            <span className="text-xs font-medium text-gray-500 mb-1 block">Milestones ({editForm.milestones.length}/3)</span>
                            {editForm.milestones.map((m, i) => (
                              <div key={i} className="flex gap-2 mb-2">
                                <input
                                  value={m}
                                  onChange={e => updateEditMilestone(i, e.target.value)}
                                  placeholder={`Milestone ${i + 1}`}
                                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0B4B3B] focus:border-transparent outline-none"
                                />
                                {editForm.milestones.length > 1 && (
                                  <button onClick={() => removeEditMilestone(i)} className="text-gray-400 hover:text-red-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            ))}
                            {editForm.milestones.length < 3 && (
                              <button onClick={addEditMilestone} className="text-xs text-[#0B4B3B] font-medium hover:underline">
                                + Add milestone
                              </button>
                            )}
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={saveEdit}
                              className="flex-1 bg-[#0B4B3B] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#0d6b54] transition"
                            >
                              Save Changes
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => deleteProposal(proposal.id)}
                              className="px-3 py-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                              title="Delete proposal"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={proposal.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-900">{proposal.name}</h4>
                            {proposal.source === 'carry-forward' && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Carry Forward</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span
                              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                              style={{ backgroundColor: getMemberColor(proposal.owner) }}
                            >
                              {proposal.owner[0]}
                            </span>
                            {proposal.owner}
                            <span className="text-gray-300">|</span>
                            <span>Proposed by {proposal.proposed_by}</span>
                          </div>
                        </div>
                        {/* Edit Button */}
                        <button
                          onClick={() => startEditing(proposal)}
                          className="p-1.5 text-gray-400 hover:text-[#0B4B3B] hover:bg-gray-100 rounded-lg transition"
                          title="Edit proposal"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>

                      {proposal.definition_of_done && (
                        <p className="text-sm text-gray-600 mb-3">{proposal.definition_of_done}</p>
                      )}

                      {proposal.milestones.length > 0 && (
                        <div className="mb-3">
                          {proposal.milestones.map((m, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="w-4 h-4 rounded border border-gray-300 flex-shrink-0" />
                              {m}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Status Controls */}
                      <div className="flex gap-2">
                        {([
                          { status: 'approved' as const, label: 'Approved', active: 'bg-green-500 text-white', inactive: 'bg-green-50 text-green-700 hover:bg-green-100' },
                          { status: 'needs-discussion' as const, label: 'Needs Discussion', active: 'bg-yellow-500 text-white', inactive: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
                          { status: 'parked' as const, label: 'Parked', active: 'bg-gray-500 text-white', inactive: 'bg-gray-100 text-gray-600 hover:bg-gray-200' },
                        ]).map(btn => (
                          <button
                            key={btn.status}
                            onClick={() => updateStatus(proposal.id, btn.status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                              proposal.status === btn.status ? btn.active : btn.inactive
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
