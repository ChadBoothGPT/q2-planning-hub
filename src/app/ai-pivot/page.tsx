'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@/lib/UserContext';
import { DEPARTMENTS, TEAM_MEMBERS } from '@/lib/constants';
import { AICommitment, AIWorkflow } from '@/lib/types';

const EMPTY_WORKFLOW: AIWorkflow = { name: '', pain_point: '', success_metric: '', owner_today: '' };

function getEmptyCommitment(dept: typeof DEPARTMENTS[number]): Partial<AICommitment> {
  return {
    department: dept.id,
    department_lead: '',
    champion_names: '',
    workflows: [{ ...EMPTY_WORKFLOW }, { ...EMPTY_WORKFLOW }],
    capacity_hours_per_week: 0,
    support_needed: '',
    updated_by: '',
  };
}

// Discovery questions for the AI Opportunity Finder
const DISCOVERY_QUESTIONS = [
  {
    icon: '⏱️',
    signal: 'Time Sink',
    question: 'What task takes your team the longest but doesn\'t require creative judgment?',
    followUp: 'If it takes more than 2 hours and follows a pattern, AI can probably help.',
  },
  {
    icon: '🔁',
    signal: 'Repetitive Work',
    question: 'Where does someone copy-paste between systems, re-enter the same data, or follow the exact same steps every time?',
    followUp: 'Repetitive, rule-based work is where AI delivers the fastest ROI.',
  },
  {
    icon: '⏳',
    signal: 'Waiting Bottleneck',
    question: 'What decisions get delayed because gathering or compiling the information takes too long?',
    followUp: 'AI excels at pulling together data from multiple sources in seconds.',
  },
  {
    icon: '📄',
    signal: 'Document Heavy',
    question: 'Where does someone read, summarize, or extract information from large volumes of text, emails, or data?',
    followUp: 'AI can read and summarize hundreds of documents in the time it takes a person to read one.',
  },
  {
    icon: '🔍',
    signal: 'Quality Risk',
    question: 'What process breaks when someone\'s out sick, makes a typo, or misses a step?',
    followUp: 'If it depends on one person\'s memory or attention to detail, AI can add a safety net.',
  },
];

// Department-specific inspiration chips
const INSPIRATION_CHIPS: Record<string, { label: string; pain: string }[]> = {
  'finance': [
    { label: 'Invoice Matching', pain: 'Manually matching invoices to POs takes hours each week' },
    { label: 'Variance Analysis', pain: 'Monthly budget vs. actual analysis requires pulling from 5+ sources' },
    { label: 'Expense Auditing', pain: 'Reviewing expense reports for policy compliance is tedious and error-prone' },
    { label: 'Cash Flow Forecasting', pain: 'Building cash flow projections requires manual data consolidation' },
    { label: 'Vendor Payment Tracking', pain: 'Following up on pending payments and reconciling vendor accounts' },
    { label: 'Month-End Close Checklist', pain: 'Coordinating 20+ close tasks across team with manual status tracking' },
  ],
  'people-ta': [
    { label: 'Candidate Sourcing', pain: 'Searching multiple platforms to build qualified candidate pipelines' },
    { label: 'Job Description Writing', pain: 'Creating role-specific JDs from scratch for each new opening' },
    { label: 'Offer Letter Generation', pain: 'Assembling offer packages with correct comp, benefits, and terms' },
    { label: 'Hiring Pipeline Analytics', pain: 'Manually compiling time-to-fill, source-of-hire, and conversion metrics' },
    { label: 'Client Intake Summaries', pain: 'Summarizing client requirements and translating to recruitment criteria' },
    { label: 'Candidate Reactivation', pain: 'Identifying past candidates who match new openings from old records' },
  ],
  'people-hr': [
    { label: 'Policy Q&A', pain: 'HR team answering the same benefits and policy questions repeatedly' },
    { label: 'Onboarding Coordination', pain: 'Tracking 30+ onboarding tasks per new hire across multiple systems' },
    { label: 'Leave Balance Auditing', pain: 'Manually reconciling leave records across payroll and HRIS' },
    { label: 'Performance Review Prep', pain: 'Compiling feedback, goals, and metrics before each review cycle' },
    { label: 'Compliance Reporting', pain: 'Pulling and formatting data for labor compliance and government reports' },
    { label: 'Employee Data Updates', pain: 'Processing address changes, bank details, and status updates across systems' },
  ],
};

export default function AIPivotPage() {
  const { currentUser } = useUser();
  const [commitments, setCommitments] = useState<Record<string, Partial<AICommitment>>>({});
  const [expandedDept, setExpandedDept] = useState<string>(DEPARTMENTS[0].id);
  const [showGuide, setShowGuide] = useState(false);
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const fetchCommitments = useCallback(async () => {
    const res = await fetch('/api/commitments');
    const data: AICommitment[] = await res.json();
    const map: Record<string, Partial<AICommitment>> = {};
    DEPARTMENTS.forEach(d => {
      const existing = data.find(c => c.department === d.id);
      map[d.id] = existing || getEmptyCommitment(d);
    });
    setCommitments(map);
  }, []);

  useEffect(() => { fetchCommitments(); }, [fetchCommitments]);

  function updateField(deptId: string, field: string, value: unknown) {
    setCommitments(prev => {
      const updated = { ...prev, [deptId]: { ...prev[deptId], [field]: value, updated_by: currentUser } };
      if (debounceTimers.current[deptId]) clearTimeout(debounceTimers.current[deptId]);
      debounceTimers.current[deptId] = setTimeout(async () => {
        await fetch('/api/commitments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated[deptId]),
        });
      }, 500);
      return updated;
    });
  }

  function updateWorkflow(deptId: string, idx: number, field: keyof AIWorkflow, value: string) {
    const current = commitments[deptId]?.workflows || [];
    const updated = current.map((w, i) => i === idx ? { ...w, [field]: value } : w);
    updateField(deptId, 'workflows', updated);
  }

  function addWorkflow(deptId: string) {
    const current = commitments[deptId]?.workflows || [];
    if (current.length < 5) {
      updateField(deptId, 'workflows', [...current, { ...EMPTY_WORKFLOW }]);
    }
  }

  function removeWorkflow(deptId: string, idx: number) {
    const current = commitments[deptId]?.workflows || [];
    if (current.length > 1) {
      updateField(deptId, 'workflows', current.filter((_, i) => i !== idx));
    }
  }

  function applyInspirationChip(deptId: string, chip: { label: string; pain: string }) {
    const current = commitments[deptId]?.workflows || [];
    // Find first empty slot, or add new
    const emptyIdx = current.findIndex(w => !w.name && !w.pain_point);
    if (emptyIdx >= 0) {
      const updated = current.map((w, i) => i === emptyIdx ? { ...w, name: chip.label, pain_point: chip.pain } : w);
      updateField(deptId, 'workflows', updated);
    } else if (current.length < 5) {
      updateField(deptId, 'workflows', [...current, { ...EMPTY_WORKFLOW, name: chip.label, pain_point: chip.pain }]);
    }
  }

  function getCompletion(dept: Partial<AICommitment>): number {
    let filled = 0;
    const total = 5;
    if (dept.department_lead) filled++;
    if (dept.champion_names) filled++;
    if ((dept.workflows || []).some(w => w.name)) filled++;
    if ((dept.capacity_hours_per_week || 0) > 0) filled++;
    if (dept.support_needed) filled++;
    return Math.round((filled / total) * 100);
  }

  const allWorkflows = DEPARTMENTS.flatMap(d => {
    const c = commitments[d.id];
    return (c?.workflows || [])
      .filter(w => w.name)
      .map(w => ({ ...w, department: d.name }));
  });

  const totalHours = DEPARTMENTS.reduce((sum, d) => sum + (commitments[d.id]?.capacity_hours_per_week || 0), 0);

  const warnings: string[] = [];
  DEPARTMENTS.forEach(d => {
    const c = commitments[d.id];
    if (!c?.champion_names) warnings.push(`${d.name} has no champion assigned`);
    if ((c?.capacity_hours_per_week || 0) === 0) warnings.push(`${d.name} has 0 hours/week committed`);
    (c?.workflows || []).filter(w => w.name && !w.success_metric).forEach(w => {
      warnings.push(`No success metric defined for "${w.name}" (${d.name})`);
    });
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Pivot Canvas</h1>
      <p className="text-sm text-gray-500 mb-6">Plan AI adoption across departments for Q2</p>

      {/* AI Opportunity Finder Guide */}
      <div className="mb-8">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#0B4B3B] to-[#0d6b54] text-white rounded-xl text-sm font-medium hover:from-[#0d6b54] hover:to-[#0f8068] transition shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          AI Opportunity Finder — Not sure where AI can help? Start here
          <svg className={`w-4 h-4 transition-transform ${showGuide ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showGuide && (
          <div className="mt-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-600 mb-5">
              You don&apos;t need to know what AI can do — just answer these questions about your department.
              If you answer &quot;yes&quot; to any of them, that&apos;s an AI opportunity worth exploring.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DISCOVERY_QUESTIONS.map((q, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-[#A3D7C9] hover:bg-[#f8faf9] transition">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{q.icon}</span>
                    <span className="font-semibold text-sm text-[#0B4B3B]">{q.signal}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{q.question}</p>
                  <p className="text-xs text-gray-400 italic">{q.followUp}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column: Department Cards */}
        <div className="lg:col-span-3 space-y-4">
          {DEPARTMENTS.map(dept => {
            const c = commitments[dept.id] || getEmptyCommitment(dept);
            const isExpanded = expandedDept === dept.id;
            const completion = getCompletion(c);
            const chips = INSPIRATION_CHIPS[dept.id] || [];
            const usedNames = (c.workflows || []).map(w => w.name);

            return (
              <div key={dept.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => setExpandedDept(isExpanded ? '' : dept.id)}
                >
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-gray-900">{dept.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${completion === 100 ? 'bg-green-500' : completion > 0 ? 'bg-yellow-500' : 'bg-gray-300'}`}
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{completion}%</span>
                    </div>
                  </div>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 p-5 space-y-5">
                    {/* Department Lead */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department Lead</label>
                      <select
                        value={c.department_lead || ''}
                        onChange={e => updateField(dept.id, 'department_lead', e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0B4B3B] focus:border-transparent outline-none"
                      >
                        <option value="">Select lead...</option>
                        {TEAM_MEMBERS.map(m => (
                          <option key={m.name} value={m.name}>{m.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* AI Champions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">AI Champion(s)</label>
                      <input
                        value={c.champion_names || ''}
                        onChange={e => updateField(dept.id, 'champion_names', e.target.value)}
                        placeholder="Name the person(s) who will drive AI adoption"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0B4B3B] focus:border-transparent outline-none"
                      />
                      <p className="text-xs text-gray-400 mt-1">Must be someone who knows the business and workflows — not necessarily technical</p>
                    </div>

                    {/* AI Opportunities */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          AI Opportunities ({(c.workflows || []).filter(w => w.name).length})
                        </label>
                      </div>

                      {/* Inspiration Chips */}
                      <div className="mb-4">
                        <p className="text-xs text-gray-400 mb-2">Click an idea to get started, or add your own below:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {chips.filter(ch => !usedNames.includes(ch.label)).map((chip, i) => (
                            <button
                              key={i}
                              onClick={() => applyInspirationChip(dept.id, chip)}
                              className="px-2.5 py-1 rounded-full text-xs bg-[#DBEAF4] text-[#0B4B3B] font-medium hover:bg-[#c5dced] transition"
                              title={chip.pain}
                            >
                              + {chip.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {(c.workflows || []).map((w, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-4 mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-[#0B4B3B]">Opportunity {i + 1}</span>
                            {(c.workflows || []).length > 1 && (
                              <button onClick={() => removeWorkflow(dept.id, i)} className="text-gray-400 hover:text-red-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                          <input
                            value={w.name}
                            onChange={e => updateWorkflow(dept.id, i, 'name', e.target.value)}
                            placeholder="Name this opportunity (e.g., Invoice Matching)"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 font-medium focus:ring-2 focus:ring-[#0B4B3B] focus:border-transparent outline-none"
                          />
                          <div className="relative mb-2">
                            <label className="absolute -top-0.5 left-3 bg-gray-50 px-1 text-[10px] text-gray-400 font-medium">What&apos;s the pain today?</label>
                            <textarea
                              value={w.pain_point}
                              onChange={e => updateWorkflow(dept.id, i, 'pain_point', e.target.value)}
                              placeholder="e.g., Takes 4 hours to compile monthly close report from 5 different spreadsheets"
                              rows={2}
                              className="w-full border border-gray-200 rounded-lg px-3 pt-4 pb-2 text-sm focus:ring-2 focus:ring-[#0B4B3B] focus:border-transparent outline-none resize-none"
                            />
                          </div>
                          <div className="relative mb-2">
                            <label className="absolute -top-0.5 left-3 bg-gray-50 px-1 text-[10px] text-gray-400 font-medium">What does good look like?</label>
                            <input
                              value={w.success_metric}
                              onChange={e => updateWorkflow(dept.id, i, 'success_metric', e.target.value)}
                              placeholder="e.g., Under 30 minutes with AI-assisted data pull"
                              className="w-full border border-gray-200 rounded-lg px-3 pt-4 pb-2 text-sm focus:ring-2 focus:ring-[#0B4B3B] focus:border-transparent outline-none"
                            />
                          </div>
                          <div className="relative">
                            <label className="absolute -top-0.5 left-3 bg-gray-50 px-1 text-[10px] text-gray-400 font-medium">Who owns this today?</label>
                            <input
                              value={w.owner_today}
                              onChange={e => updateWorkflow(dept.id, i, 'owner_today', e.target.value)}
                              placeholder="e.g., Maria (Sr. Accountant)"
                              className="w-full border border-gray-200 rounded-lg px-3 pt-4 pb-2 text-sm focus:ring-2 focus:ring-[#0B4B3B] focus:border-transparent outline-none"
                            />
                          </div>
                        </div>
                      ))}
                      {(c.workflows || []).length < 5 && (
                        <button onClick={() => addWorkflow(dept.id)} className="text-sm text-[#0B4B3B] font-medium hover:underline">
                          + Add another opportunity
                        </button>
                      )}
                    </div>

                    {/* Capacity Commitment */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Capacity Commitment: {c.capacity_hours_per_week || 0} hrs/week
                        <span className="text-gray-400 ml-2">({((c.capacity_hours_per_week || 0) / 40).toFixed(1)} FTE)</span>
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={40}
                        value={c.capacity_hours_per_week || 0}
                        onChange={e => updateField(dept.id, 'capacity_hours_per_week', parseInt(e.target.value))}
                        className="w-full accent-[#0B4B3B]"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>0 hrs</span>
                        <span>20 hrs</span>
                        <span>40 hrs</span>
                      </div>
                    </div>

                    {/* Support Needed */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Support Needed from Leadership</label>
                      <textarea
                        value={c.support_needed || ''}
                        onChange={e => updateField(dept.id, 'support_needed', e.target.value)}
                        placeholder="What do you need from Chad and the team to make this work?"
                        rows={2}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0B4B3B] focus:border-transparent outline-none resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: AI Adoption Map */}
        <div className="lg:col-span-2 space-y-6">
          {/* Department Readiness */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4">Department Readiness</h3>
            <div className="space-y-3">
              {DEPARTMENTS.map(dept => {
                const c = commitments[dept.id];
                const hasChampion = !!c?.champion_names;
                const workflowCount = (c?.workflows || []).filter(w => w.name).length;
                const hours = c?.capacity_hours_per_week || 0;
                const status = hasChampion && workflowCount > 0 && hours > 0 ? 'green' : hasChampion || workflowCount > 0 || hours > 0 ? 'yellow' : 'gray';
                const statusColors = { green: 'border-green-300 bg-green-50', yellow: 'border-yellow-300 bg-yellow-50', gray: 'border-gray-200 bg-gray-50' };

                return (
                  <div key={dept.id} className={`rounded-xl border p-3 ${statusColors[status]}`}>
                    <div className="font-medium text-sm text-gray-900">{dept.name}</div>
                    <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                      <div>Champion: {c?.champion_names || <span className="text-yellow-600 font-medium">Not assigned</span>}</div>
                      <div>{workflowCount} opportunit{workflowCount !== 1 ? 'ies' : 'y'} identified</div>
                      <div>{hours} hrs/week committed</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total Capacity */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-3">Total Capacity</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#0B4B3B]">{totalHours}</div>
              <div className="text-sm text-gray-500">hours/week</div>
              <div className="text-lg font-semibold text-gray-700 mt-1">{(totalHours / 40).toFixed(1)} FTE</div>
            </div>
            {totalHours > 0 && (
              <div className="mt-4 space-y-2">
                {DEPARTMENTS.map(d => {
                  const hrs = commitments[d.id]?.capacity_hours_per_week || 0;
                  const pct = totalHours > 0 ? (hrs / totalHours) * 100 : 0;
                  return (
                    <div key={d.id}>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{d.name}</span>
                        <span>{hrs} hrs</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="h-2 rounded-full bg-[#0B4B3B]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Opportunity Pipeline */}
          {allWorkflows.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-3">AI Opportunity Pipeline</h3>
              <div className="space-y-2">
                {allWorkflows.map((w, i) => (
                  <div key={i} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#DBEAF4] text-[#0B4B3B] font-medium">{w.department}</span>
                      <span className="font-medium text-sm text-gray-900">{w.name}</span>
                    </div>
                    {w.pain_point && (
                      <div className="text-xs text-gray-500 mb-0.5">Pain: {w.pain_point}</div>
                    )}
                    {w.success_metric && (
                      <div className="text-xs text-green-600">Target: {w.success_metric}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gaps & Warnings */}
          {warnings.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-yellow-200 p-5">
              <h3 className="font-bold text-yellow-700 mb-3">Gaps & Warnings</h3>
              <div className="space-y-2">
                {warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-yellow-700">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    {w}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
