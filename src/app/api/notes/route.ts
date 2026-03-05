import { NextRequest, NextResponse } from 'next/server';
import { getNotes, addNote, deleteNote } from '@/lib/db';
import { PlanningNote } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  return NextResponse.json(await getNotes());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const note: PlanningNote = {
    id: body.id || uuidv4(),
    content: body.content,
    category: body.category,
    author: body.author,
    created_at: '',
  };
  const saved = await addNote(note);
  return NextResponse.json(saved);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const success = await deleteNote(id);
  if (!success) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
