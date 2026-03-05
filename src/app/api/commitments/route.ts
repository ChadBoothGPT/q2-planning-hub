import { NextRequest, NextResponse } from 'next/server';
import { getCommitments, upsertCommitment } from '@/lib/db';
import { AICommitment } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  return NextResponse.json(await getCommitments());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const commitment: AICommitment = {
    id: body.id || uuidv4(),
    department: body.department,
    department_lead: body.department_lead || '',
    champion_names: body.champion_names || '',
    workflows: body.workflows || [],
    capacity_hours_per_week: body.capacity_hours_per_week || 0,
    support_needed: body.support_needed || '',
    updated_by: body.updated_by || '',
    created_at: '',
    updated_at: '',
  };
  const saved = await upsertCommitment(commitment);
  return NextResponse.json(saved);
}
