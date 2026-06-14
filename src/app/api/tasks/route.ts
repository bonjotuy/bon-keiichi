import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET() {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const tasks = (data || []).map(row => ({
    id: row.id,
    title: row.title,
    description: row.description,
    assignee: row.assignee,
    project: row.project,
    priority: row.priority,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))

  return NextResponse.json({ tasks })
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  const body = await req.json()

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: body.title,
      description: body.description || '',
      assignee: body.assignee,
      project: body.project,
      priority: body.priority,
      status: body.status || '未着手',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    id: data.id,
    title: data.title,
    description: data.description,
    assignee: data.assignee,
    project: data.project,
    priority: data.priority,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }, { status: 201 })
}
