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

export async function GET() {
  const tasks = readTasks()
  return NextResponse.json({ tasks })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const tasks = readTasks()
  const newTask: Task = {
    id: Date.now().toString(),
    type: body.type || 'task',
    title: body.title,
    description: body.description || '',
    assignee: body.assignee,
    project: body.project,
    priority: body.priority,
    status: body.status || '未着手',
    createdAt: new Date().toISOString(),
    dueDate: body.dueDate || undefined,
    deleted: false,
  }
  tasks.unshift(newTask)
  writeTasks(tasks)
  return NextResponse.json(newTask, { status: 201 })
}
