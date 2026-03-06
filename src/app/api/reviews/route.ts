import { NextRequest, NextResponse } from 'next/server';
import { getReviews, upsertReview } from '@/lib/db';
import { RockReview } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  return NextResponse.json(await getReviews());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const review: RockReview = {
    id: body.id || uuidv4(),
    rock_id: body.rock_id,
    reviewer: body.reviewer,
    outcome: body.outcome,
    key_takeaway: body.key_takeaway || '',
    carry_forward: body.carry_forward || false,
    rock_progress: body.rock_progress ?? null,
    rock_description: body.rock_description ?? null,
    created_at: '',
    updated_at: '',
  };
  const saved = await upsertReview(review);
  return NextResponse.json(saved);
}
