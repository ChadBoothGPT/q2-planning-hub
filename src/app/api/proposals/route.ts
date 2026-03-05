import { NextRequest, NextResponse } from 'next/server';
import { getProposals, addProposal, updateProposalStatus, updateProposal } from '@/lib/db';
import { RockProposal } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  return NextResponse.json(await getProposals());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const proposal: RockProposal = {
    id: body.id || uuidv4(),
    name: body.name,
    pillar: body.pillar,
    owner: body.owner,
    proposed_by: body.proposed_by,
    definition_of_done: body.definition_of_done || '',
    milestones: body.milestones || [],
    status: body.status || 'proposed',
    source: body.source || 'new',
    source_rock_id: body.source_rock_id || null,
    created_at: '',
    updated_at: '',
  };
  const saved = await addProposal(proposal);
  return NextResponse.json(saved);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();

  // If only status is being updated, use the simple status updater
  if (body.id && body.status && Object.keys(body).length === 2) {
    const updated = await updateProposalStatus(body.id, body.status);
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  }

  // Otherwise do a full update
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const updated = await updateProposal(id, updates);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}
