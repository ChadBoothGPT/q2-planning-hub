export interface TeamMember {
  name: string;
  color: string;
}

export interface StrategicPillar {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
}

export interface Q1Rock {
  id: string;
  name: string;
  pillar: string;
  owner: string;
  status: 'on-track' | 'off-track' | 'completed';
  progress: number;
  description: string;
}

export interface RockReview {
  id: string;
  rock_id: string;
  reviewer: string;
  outcome: 'hit' | 'partially' | 'missed';
  key_takeaway: string;
  carry_forward: boolean;
  created_at: string;
  updated_at: string;
}

export interface RockProposal {
  id: string;
  name: string;
  pillar: string;
  owner: string;
  proposed_by: string;
  definition_of_done: string;
  milestones: string[];
  status: 'proposed' | 'approved' | 'needs-discussion' | 'parked';
  source: 'new' | 'carry-forward';
  source_rock_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIWorkflow {
  name: string;
  pain_point: string;
  success_metric: string;
  owner_today: string;
}

export interface AICommitment {
  id: string;
  department: 'finance' | 'people-ta' | 'people-hr';
  department_lead: string;
  champion_names: string;
  workflows: AIWorkflow[];
  capacity_hours_per_week: number;
  support_needed: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface PlanningNote {
  id: string;
  content: string;
  category: 'action-item' | 'decision' | 'parking-lot';
  author: string;
  created_at: string;
}
