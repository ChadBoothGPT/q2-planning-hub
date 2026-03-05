import { TeamMember, StrategicPillar, Q1Rock } from './types';

export const TEAM_MEMBERS: TeamMember[] = [
  { name: 'Chad', color: '#3B82F6' },
  { name: 'Jamie', color: '#10B981' },
  { name: 'Carmen', color: '#8B5CF6' },
  { name: 'Chris', color: '#F59E0B' },
  { name: 'Jen', color: '#EC4899' },
  { name: 'John', color: '#06B6D4' },
  { name: 'Elaine', color: '#F97316' },
  { name: 'Suselle', color: '#14B8A6' },
  { name: 'Kathy', color: '#EF4444' },
  { name: 'Michelle', color: '#6366F1' },
];

export const STRATEGIC_PILLARS: StrategicPillar[] = [
  { id: 'booth-os', name: 'BoothOS', icon: '🖥️', color: '#CD9ACD', bgColor: '#FDF4FF', description: 'Platform adoption - Unify HR, payroll, and performance systems' },
  { id: 'booth-agent', name: 'BoothAgent', icon: '🤖', color: '#0B4B3B', bgColor: '#E8F5F1', description: 'AI agent product - Next-gen AI product line' },
  { id: 'booth-growth', name: 'BoothGrowth', icon: '📈', color: '#3B82F6', bgColor: '#EFF6FF', description: 'Revenue growth - Drive smart, sustainable growth' },
  { id: 'booth-brain', name: 'BoothBrain', icon: '🧠', color: '#8B5CF6', bgColor: '#F5F3FF', description: 'Data & analytics - Process governance and enterprise data' },
  { id: 'core-ops', name: 'Core Operations', icon: '⚙️', color: '#6B7280', bgColor: '#F9FAFB', description: 'Operational excellence - Internal processes and infrastructure' },
];

export const Q1_ROCKS: Q1Rock[] = [
  // On Track
  {
    id: 'rock-1',
    name: 'First Client Deployment',
    pillar: 'booth-agent',
    owner: 'Chad',
    status: 'on-track',
    progress: 30,
    description: 'Deploy first AI agent client engagement',
  },
  {
    id: 'rock-2',
    name: 'Data Model and Stack',
    pillar: 'booth-brain',
    owner: 'Chad',
    status: 'on-track',
    progress: 60,
    description: 'Establish enterprise data model and technology stack',
  },
  {
    id: 'rock-3',
    name: 'Implement Proactive Retention Playbook',
    pillar: 'booth-growth',
    owner: 'Chris',
    status: 'on-track',
    progress: 50,
    description: 'Build and implement proactive client retention strategy',
  },
  {
    id: 'rock-4',
    name: 'BeamAI TA Agents - Phase 1',
    pillar: 'booth-agent',
    owner: 'Elaine',
    status: 'on-track',
    progress: 85,
    description: 'Launch Phase 1 of BeamAI talent acquisition agents',
  },
  // Off Track
  {
    id: 'rock-5',
    name: 'Process Gov for Emp Creations and Changes',
    pillar: 'booth-os',
    owner: 'Chad',
    status: 'off-track',
    progress: 35,
    description: 'Establish process governance for employee creations and changes',
  },
  {
    id: 'rock-6',
    name: 'Booth Platform, powered by Deel',
    pillar: 'booth-os',
    owner: 'Elaine',
    status: 'off-track',
    progress: 50,
    description: 'Integrate and launch Booth Platform powered by Deel',
  },
  {
    id: 'rock-7',
    name: 'Execute Booth OS Platform Public Launch',
    pillar: 'booth-growth',
    owner: 'Jen',
    status: 'off-track',
    progress: 90,
    description: 'Execute public launch of the Booth OS platform',
  },
  {
    id: 'rock-8',
    name: 'Implement New Ticketing System',
    pillar: 'core-ops',
    owner: 'Kathy',
    status: 'off-track',
    progress: 64,
    description: 'Implement new internal ticketing system for operations',
  },
  // Completed
  {
    id: 'rock-9',
    name: 'AI Governance Policies',
    pillar: 'core-ops',
    owner: 'Chad',
    status: 'completed',
    progress: 100,
    description: 'Establish AI governance policies and compliance framework',
  },
  {
    id: 'rock-10',
    name: 'MS IT Pilot',
    pillar: 'booth-growth',
    owner: 'Jen',
    status: 'completed',
    progress: 100,
    description: 'Execute Microsoft IT managed services pilot program',
  },
];

export const DEPARTMENTS = [
  { id: 'finance' as const, name: 'Finance' },
  { id: 'people-ta' as const, name: 'People - Talent Acquisition' },
  { id: 'people-hr' as const, name: 'People - HR' },
];

export function getPillar(id: string): StrategicPillar | undefined {
  return STRATEGIC_PILLARS.find(p => p.id === id);
}

export function getMemberColor(name: string): string {
  return TEAM_MEMBERS.find(m => m.name === name)?.color ?? '#6B7280';
}
