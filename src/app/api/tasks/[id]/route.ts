import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { Task } from '@/types/task'

const DATA_FILE = path.join(process.cwd(), 'data', 'tasks.json')

function readTasks(): Task[] {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8')
  return JSON.parse(raw).tasks || []
}

function writeTasks(tasks: Task[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ tasks }, null, 2))
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json()
  const tasks = readTasks()
  const idx = tasks.findIndex(t => t.id === params.id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  tasks[idx] = {
    ...tasks[idx],
    ...body,
    updatedAt: new Date().toISOString(),
  }
  writeTasks(tasks)
  return NextResponse.json(tasks[idx])
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const tasks = readTasks()
  const idx = tasks.findIndex(t => t.id === params.id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // 永久削除
  tasks.splice(idx, 1)
  writeTasks(tasks)
  return NextResponse.json({ success: true })
}
