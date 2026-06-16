import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

function toTask(row: Record<string, unknown>) {
  return {
    id: row.id,
    type: row.type ?? 'task',
    title: row.title,
    description: row.description,
    assignee: row.assignee,
    project: row.project,
    priority: row.priority,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    dueDate: row.due_date,
    deleted: row.deleted ?? false,
  }
}

export async function GET() {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tasks: (data || []).map(toTask) })
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  const body = await req.json()

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      type: body.type || 'task',
      title: body.title,
      description: body.description || '',
      assignee: body.assignee,
      project: body.project,
      priority: body.priority,
      status: body.status || '未着手',
      due_date: body.dueDate || null,
      deleted: false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(toTask(data), { status: 201 })
}
