'use client';

import { useState, useEffect, useCallback } from 'react';
import { Q1_ROCKS, STRATEGIC_PILLARS, DEPARTMENTS, getMemberColor } from '@/lib/constants';
import { RockReview, RockProposal, AICommitment, PlanningNote } from '@/lib/types';
import PillarBadge from '@/components/PillarBadge';
import StatusBadge from '@/components/StatusBadge';

export default function SummaryPage() {
  const [reviews, setReviews] = useState<RockReview[]>([]);
  const [proposals, setProposals] = useState<RockProposal[]>([]);
  const [commitments, setCommitments] = useState<AICommitment[]>([]);
  const [notes, setNotes] = useState<PlanningNote[]>([]);

  const fetchAll = useCallback(async () => {
    const [revRes, propRes, comRes, noteRes] = await Promise.all([
      fetch('/api/reviews'),
      fetch('/api/proposals'),
      fetch('/api/commitments'),
      fetch('/api/notes'),
    ]);
    setReviews(await revRes.json());
    setProposals(await propRes.json());
    setCommitments(await comRes.json());
    setNotes(await noteRes.json());
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Q1 Scorecard: determine consensus outcome per rock
  function getConsensusOutcome(rockId: string): { outcome: string; count: number; total: number } {
    const rockReviews = reviews.filter(r => r.rock_id === rockId);
    if (rockReviews.length === 0) return { outcome: 'pending', count: 0, total: 0 };
    const counts = { hit: 0, partially: 0, missed: 0 };
    rockReviews.forEach(r => counts[r.outcome]++);
    const max = Math.max(counts.hit, counts.partially, counts.missed);
    const outcome = counts.hit === max ? 'hit' : counts.partially === max ? 'partially' : 'missed';
    return { outcome, count: max, total: rockReviews.length };
  }

  function getCarryForwardCount(rockId: string): number {
    return reviews.filter(r => r.rock_id === rockId && r.carry_forward).length;
  }

  const q1Stats = {
    hit: Q1_ROCKS.filter(r => getConsensusOutcome(r.id).outcome === 'hit').length,
    partially: Q1_ROCKS.filter(r => getConsensusOutcome(r.id).outcome === 'partially').length,
    missed: Q1_ROCKS.filter(r => getConsensusOutcome(r.id).outcome === 'missed').length,
    carryForward: Q1_ROCKS.filter(r => getCarryForwardCount(r.id) > 0).length,
  };

  // Q2 approved rocks
  const approvedRocks = proposals.filter(p => p.status === 'approved');
  const needsDiscussion = proposals.filter(p => p.status === 'needs-discussion');

  // Grouped approved rocks by pillar
  const groupedApproved = STRATEGIC_PILLARS.map(p => ({
    pillar: p,
    rocks: approvedRocks.filter(r => r.pillar === p.id),
  }));
  const emptyPillars = groupedApproved.filter(g => g.rocks.length === 0);

  // AI commitments
  const totalHours = commitments.reduce((sum, c) => sum + (c.capacity_hours_per_week || 0), 0);
  const allWorkflows = commitments.flatMap(c =>
    (c.workflows || []).filter(w => w.name).map(w => ({
      ...w,
      department: DEPARTMENTS.find(d => d.id === c.department)?.name || c.department,
    }))
  );

  // Notes grouped by category
  const actionItems = notes.filter(n => n.category === 'action-item');
  const decisions = notes.filter(n => n.category === 'decision');
  const parkingLot = notes.filter(n => n.category === 'parking-lot');

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Summary Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">End-of-meeting overview - designed for the big screen</p>
      </div>

      {/* Section 1: Q1 Scorecard */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900">Q1 Scorecard</h2>
          <div className="flex gap-3 text-sm">
            <span className="text-green-600 font-semibold">{q1Stats.hit} Hit</span>
            <span className="text-yellow-600 font-semibold">{q1Stats.partially} Partial</span>
            <span className="text-red-600 font-semibold">{q1Stats.missed} Missed</span>
            <span className="text-blue-600 font-semibold">{q1Stats.carryForward} Carry Fwd</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Rock</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Pillar</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Owner</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Outcome</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Carry Fwd?</th>
              </tr>
            </thead>
            <tbody>
              {Q1_ROCKS.map(rock => {
                const consensus = getConsensusOutcome(rock.id);
                const cfCount = getCarryForwardCount(rock.id);
                const rowBg = consensus.outcome === 'hit' ? 'bg-green-50/50' : consensus.outcome === 'partially' ? 'bg-yellow-50/50' : consensus.outcome === 'missed' ? 'bg-red-50/50' : '';
                return (
                  <tr key={rock.id} className={`border-b border-gray-50 ${rowBg}`}>
                    <td className="px-5 py-3 font-medium text-gray-900">{rock.name}</td>
                    <td className="px-5 py-3"><PillarBadge pillarId={rock.pillar} /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: getMemberColor(rock.owner) }}>
                          {rock.owner[0]}
                        </span>
                        {rock.owner}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {consensus.total > 0 ? (
                        <div className="flex items-center gap-2">
                          <StatusBadge status={consensus.outcome} />
                          <span className="text-xs text-gray-400">({consensus.count}/{consensus.total})</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No reviews</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {cfCount > 0 ? (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Yes ({cfCount})</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 2: Q2 Rock Plan */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900">Q2 Rock Plan</h2>
          <span className="text-sm text-gray-500">({approvedRocks.length} approved rocks)</span>
        </div>

        {emptyPillars.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 text-sm text-yellow-700">
            Missing rocks for: {emptyPillars.map(p => p.pillar.name).join(', ')}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupedApproved.filter(g => g.rocks.length > 0).map(({ pillar, rocks }) => (
            <div key={pillar.id}>
              <div className="flex items-center gap-2 mb-2">
                <span>{pillar.icon}</span>
                <span className="font-bold text-sm" style={{ color: pillar.color }}>{pillar.name}</span>
              </div>
              {rocks.map(rock => (
                <div key={rock.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-2">
                  <div className="font-medium text-gray-900 text-sm">{rock.name}</div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: getMemberColor(rock.owner) }}>
                      {rock.owner[0]}
                    </span>
                    {rock.owner}
                  </div>
                  {rock.definition_of_done && <p className="text-xs text-gray-500 mt-2">{rock.definition_of_done}</p>}
                  {rock.milestones.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {rock.milestones.map((m, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
                          <span className="w-3 h-3 rounded border border-gray-300 flex-shrink-0" />
                          {m}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {approvedRocks.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
            No rocks approved yet
          </div>
        )}
      </section>

      {/* Section 3: AI Pivot Overview */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">AI Pivot Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {DEPARTMENTS.map(dept => {
            const c = commitments.find(cm => cm.department === dept.id);
            const wfCount = (c?.workflows || []).filter(w => w.name).length;
            return (
              <div key={dept.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="font-bold text-sm text-gray-900 mb-2">{dept.name}</div>
                <div className="space-y-1 text-xs text-gray-600">
                  <div>Champion: {c?.champion_names || <span className="text-yellow-600">TBD</span>}</div>
                  <div>{wfCount} opportunit{wfCount !== 1 ? 'ies' : 'y'} identified</div>
                  <div>{c?.capacity_hours_per_week || 0} hrs/week</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-6 bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
          <div>
            <span className="text-2xl font-bold text-[#0B4B3B]">{totalHours}</span>
            <span className="text-sm text-gray-500 ml-1">hrs/week total</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-gray-700">{(totalHours / 40).toFixed(1)}</span>
            <span className="text-sm text-gray-500 ml-1">FTE equivalent</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-blue-600">{allWorkflows.length}</span>
            <span className="text-sm text-gray-500 ml-1">opportunities identified</span>
          </div>
        </div>

        {/* Opportunity Details */}
        {allWorkflows.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Opportunity</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Department</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Pain Point</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Success Target</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Owner Today</th>
                </tr>
              </thead>
              <tbody>
                {allWorkflows.map((w, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{w.name}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#DBEAF4] text-[#0B4B3B] font-medium">{w.department}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-600 text-xs max-w-xs">{w.pain_point || <span className="text-gray-400">—</span>}</td>
                    <td className="px-5 py-3 text-green-600 text-xs max-w-xs">{w.success_metric || <span className="text-gray-400">—</span>}</td>
                    <td className="px-5 py-3 text-gray-600 text-xs">{w.owner_today || <span className="text-gray-400">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Section 4: Open Items */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Open Items</h2>

        {needsDiscussion.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
            <h3 className="font-semibold text-yellow-700 mb-2">Rocks Needing Discussion</h3>
            <div className="space-y-2">
              {needsDiscussion.map(r => (
                <div key={r.id} className="flex items-center gap-2 text-sm text-yellow-800">
                  <PillarBadge pillarId={r.pillar} />
                  <span className="font-medium">{r.name}</span>
                  <span className="text-yellow-600">({r.owner})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Action Items */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              Action Items ({actionItems.length})
            </h3>
            {actionItems.length === 0 ? (
              <p className="text-sm text-gray-400">None captured</p>
            ) : (
              <div className="space-y-2">
                {actionItems.map(n => (
                  <div key={n.id} className="text-sm text-gray-700 border-l-2 border-blue-300 pl-3">
                    {n.content}
                    <span className="text-xs text-gray-400 ml-2">- {n.author}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Decisions */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Decisions ({decisions.length})
            </h3>
            {decisions.length === 0 ? (
              <p className="text-sm text-gray-400">None captured</p>
            ) : (
              <div className="space-y-2">
                {decisions.map(n => (
                  <div key={n.id} className="text-sm text-gray-700 border-l-2 border-green-300 pl-3">
                    {n.content}
                    <span className="text-xs text-gray-400 ml-2">- {n.author}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Parking Lot */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-semibold text-gray-600 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full" />
              Parking Lot ({parkingLot.length})
            </h3>
            {parkingLot.length === 0 ? (
              <p className="text-sm text-gray-400">None captured</p>
            ) : (
              <div className="space-y-2">
                {parkingLot.map(n => (
                  <div key={n.id} className="text-sm text-gray-700 border-l-2 border-gray-300 pl-3">
                    {n.content}
                    <span className="text-xs text-gray-400 ml-2">- {n.author}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
