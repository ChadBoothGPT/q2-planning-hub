import { NextRequest, NextResponse } from 'next/server';
import { getCommitments, upsertCommitment, deleteCommitment } from '@/lib/db';
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
    department_name: body.department_name || '',
    department_lead: body.department_lead || '',
    champion_names: body.champion_names || '',
    workflows: body.workflows || [],
    capacity_hours_per_week: body.capacity_hours_per_week || 0,
    support_needed: body.support_needed || '',
    updated_by: body.updated_by || '',
    created_at: '',
    updated_at: '',
  };
  try {
    const saved = await upsertCommitment(commitment);
    return NextResponse.json(saved);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Commitment upsert error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { department } = await req.json();
  if (!department) return NextResponse.json({ error: 'department required' }, { status: 400 });
  const ok = await deleteCommitment(department);
  return NextResponse.json({ ok });
}
