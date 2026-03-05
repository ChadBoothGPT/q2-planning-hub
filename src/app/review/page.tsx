'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@/lib/UserContext';
import { Q1_ROCKS, TEAM_MEMBERS, getMemberColor } from '@/lib/constants';
import { RockReview } from '@/lib/types';
import PillarBadge from '@/components/PillarBadge';
import StatusBadge from '@/components/StatusBadge';

export default function ReviewPage() {
  const { currentUser } = useUser();
  const [reviews, setReviews] = useState<RockReview[]>([]);
  const [expandedRock, setExpandedRock] = useState<string | null>(null);
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const fetchReviews = useCallback(async () => {
    const res = await fetch('/api/reviews');
    setReviews(await res.json());
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const myReviews = reviews.filter(r => r.reviewer === currentUser);
  const myReviewMap = Object.fromEntries(myReviews.map(r => [r.rock_id, r]));

  const stats = {
    reviewed: myReviews.length,
    total: Q1_ROCKS.length,
    completed: myReviews.filter(r => r.outcome === 'completed').length,
    partially: myReviews.filter(r => r.outcome === 'partially').length,
    missed: myReviews.filter(r => r.outcome === 'missed').length,
    carryForward: myReviews.filter(r => r.carry_forward).length,
  };

  function saveReview(rockId: string, updates: Partial<RockReview>) {
    const existing = myReviewMap[rockId];
    const review = {
      ...(existing || { rock_id: rockId, reviewer: currentUser, outcome: 'completed', key_takeaway: '', carry_forward: false }),
      ...updates,
    };

    // Optimistic update
    setReviews(prev => {
      const idx = prev.findIndex(r => r.rock_id === rockId && r.reviewer === currentUser);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...updates } as RockReview;
        return copy;
      }
      return [...prev, review as RockReview];
    });

    // Debounced save
    if (debounceTimers.current[rockId]) clearTimeout(debounceTimers.current[rockId]);
    debounceTimers.current[rockId] = setTimeout(async () => {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });
    }, 500);
  }

  return (
    <div>
      {/* Summary Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Q1 Rock Review</h1>
            <p className="text-sm text-gray-500 mt-1">
              Reviewing as <span className="font-semibold" style={{ color: getMemberColor(currentUser) }}>{currentUser}</span>
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#0B4B3B]">{stats.reviewed}/{stats.total}</div>
              <div className="text-xs text-gray-500">Reviewed</div>
            </div>
            <div className="h-10 w-px bg-gray-200" />
            <div className="flex gap-4 text-center text-sm">
              <div><span className="text-lg font-bold text-green-600">{stats.completed}</span><br/><span className="text-gray-500">Completed</span></div>
              <div><span className="text-lg font-bold text-yellow-600">{stats.partially}</span><br/><span className="text-gray-500">Partial</span></div>
              <div><span className="text-lg font-bold text-red-600">{stats.missed}</span><br/><span className="text-gray-500">Missed</span></div>
              <div><span className="text-lg font-bold text-blue-600">{stats.carryForward}</span><br/><span className="text-gray-500">Carry Fwd</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Rock Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Q1_ROCKS.map(rock => {
          const myReview = myReviewMap[rock.id];
          const othersReviews = reviews.filter(r => r.rock_id === rock.id && r.reviewer !== currentUser);
          const reviewers = reviews.filter(r => r.rock_id === rock.id).map(r => r.reviewer);
          const isExpanded = expandedRock === rock.id;

          return (
            <div key={rock.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Card Header */}
              <div
                className="p-5 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => setExpandedRock(isExpanded ? null : rock.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{rock.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{rock.description}</p>
                  </div>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <PillarBadge pillarId={rock.pillar} />
                  <StatusBadge status={rock.status} />
                  <span className="text-xs text-gray-500">Owner: {rock.owner}</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all bg-[#0B4B3B]"
                    style={{ width: `${rock.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">{rock.progress}% complete</span>
                  {/* Reviewer dots */}
                  <div className="flex -space-x-1.5">
                    {TEAM_MEMBERS.filter(m => reviewers.includes(m.name)).map(m => (
                      <span
                        key={m.name}
                        className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold"
                        style={{ backgroundColor: m.color }}
                        title={m.name}
                      >
                        {m.name[0]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Review Form (Expanded) */}
              {isExpanded && (
                <div className="border-t border-gray-100 p-5 bg-gray-50/50">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Your Review</p>

                  {/* Outcome Toggle */}
                  <div className="flex gap-2 mb-4">
                    {(['completed', 'partially', 'missed'] as const).map(outcome => {
                      const colors = {
                        completed: 'bg-green-500 text-white',
                        partially: 'bg-yellow-500 text-white',
                        missed: 'bg-red-500 text-white',
                      };
                      const inactive = 'bg-gray-100 text-gray-600 hover:bg-gray-200';
                      const isActive = myReview?.outcome === outcome;
                      return (
                        <button
                          key={outcome}
                          onClick={() => saveReview(rock.id, { outcome })}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${isActive ? colors[outcome] : inactive}`}
                        >
                          {outcome === 'completed' ? 'Completed' : outcome === 'partially' ? 'Partially' : 'Missed'}
                        </button>
                      );
                    })}
                  </div>

                  {/* Key Takeaway */}
                  <input
                    type="text"
                    value={myReview?.key_takeaway || ''}
                    onChange={e => saveReview(rock.id, { key_takeaway: e.target.value })}
                    placeholder="What's the one thing to know?"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0B4B3B] focus:border-transparent outline-none mb-4"
                  />

                  {/* Carry Forward */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => saveReview(rock.id, { carry_forward: !myReview?.carry_forward })}
                      className={`relative w-10 h-6 rounded-full transition cursor-pointer ${myReview?.carry_forward ? 'bg-[#0B4B3B]' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${myReview?.carry_forward ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-sm text-gray-700">Carry forward to Q2?</span>
                  </label>

                  {/* Others' Reviews */}
                  {othersReviews.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Other Reviews</p>
                      <div className="space-y-2">
                        {othersReviews.map(r => (
                          <div key={r.id} className="flex items-center gap-3 text-sm">
                            <span
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: getMemberColor(r.reviewer) }}
                            >
                              {r.reviewer[0]}
                            </span>
                            <span className="font-medium text-gray-700">{r.reviewer}</span>
                            <StatusBadge status={r.outcome} />
                            {r.key_takeaway && <span className="text-gray-500 truncate">{r.key_takeaway}</span>}
                            {r.carry_forward && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Carry Fwd</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
