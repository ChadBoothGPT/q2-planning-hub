import { supabase } from './supabase';
import { RockReview, RockProposal, AICommitment, PlanningNote } from './types';

// Rock Reviews
export async function getReviews(): Promise<RockReview[]> {
  const { data, error } = await supabase
    .from('rock_reviews')
    .select('*')
    .order('created_at');
  if (error) throw error;
  return data ?? [];
}

export async function upsertReview(review: RockReview): Promise<RockReview> {
  // Exclude created_at from spread — empty string fails Supabase TIMESTAMPTZ; let DB default handle it
  const { created_at, ...reviewData } = review;
  const { data, error } = await supabase
    .from('rock_reviews')
    .upsert(
      { ...reviewData, updated_at: new Date().toISOString() },
      { onConflict: 'rock_id,reviewer' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Rock Proposals
export async function getProposals(): Promise<RockProposal[]> {
  const { data, error } = await supabase
    .from('rock_proposals')
    .select('*')
    .order('created_at');
  if (error) throw error;
  return data ?? [];
}

export async function addProposal(proposal: RockProposal): Promise<RockProposal> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('rock_proposals')
    .insert({ ...proposal, created_at: now, updated_at: now })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProposalStatus(id: string, status: RockProposal['status']): Promise<RockProposal | null> {
  const { data, error } = await supabase
    .from('rock_proposals')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function updateProposal(id: string, updates: Partial<RockProposal>): Promise<RockProposal | null> {
  const { data, error } = await supabase
    .from('rock_proposals')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) return null;
  return data;
}

// AI Commitments
export async function getCommitments(): Promise<AICommitment[]> {
  const { data, error } = await supabase
    .from('ai_commitments')
    .select('*');
  if (error) throw error;
  return data ?? [];
}

export async function upsertCommitment(commitment: AICommitment): Promise<AICommitment> {
  const { created_at, ...commitmentData } = commitment;
  const { data, error } = await supabase
    .from('ai_commitments')
    .upsert(
      { ...commitmentData, updated_at: new Date().toISOString() },
      { onConflict: 'department' }
    )
    .select()
    .single();
  if (error) throw new Error(`Supabase upsert failed: ${error.message} (code: ${error.code}, details: ${error.details})`);
  return data;
}

export async function deleteCommitment(department: string): Promise<boolean> {
  const { error } = await supabase
    .from('ai_commitments')
    .delete()
    .eq('department', department);
  return !error;
}

export async function deleteProposal(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('rock_proposals')
    .delete()
    .eq('id', id);
  return !error;
}

// Planning Notes
export async function getNotes(): Promise<PlanningNote[]> {
  const { data, error } = await supabase
    .from('planning_notes')
    .select('*')
    .order('created_at');
  if (error) throw error;
  return data ?? [];
}

export async function addNote(note: PlanningNote): Promise<PlanningNote> {
  const { data, error } = await supabase
    .from('planning_notes')
    .insert({ ...note, created_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteNote(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('planning_notes')
    .delete()
    .eq('id', id);
  return !error;
}
