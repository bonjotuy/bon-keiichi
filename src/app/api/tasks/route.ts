import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { Task, TasksData } from '@/types/task'

const dataFilePath = path.join(process.cwd(), 'data', 'tasks.json')

function readTasks(): TasksData {
  const fileContents = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(fileContents) as TasksData
}

function writeTasks(data: TasksData): void {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8')
}

export async function GET() {
  try {
    const data = readTasks()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'タスクの読み込みに失敗しました' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
    const data = readTasks()

    const newTask: Task = {
      ...body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    data.tasks.push(newTask)
    writeTasks(data)

    return NextResponse.json(newTask, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'タスクの作成に失敗しました' }, { status: 500 })
  }
}
