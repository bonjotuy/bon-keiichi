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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json() as Partial<Task>
    const data = readTasks()

    const taskIndex = data.tasks.findIndex((t) => t.id === params.id)
    if (taskIndex === -1) {
      return NextResponse.json({ error: 'タスクが見つかりません' }, { status: 404 })
    }

    data.tasks[taskIndex] = {
      ...data.tasks[taskIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    }

    writeTasks(data)
    return NextResponse.json(data.tasks[taskIndex])
  } catch {
    return NextResponse.json({ error: 'タスクの更新に失敗しました' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = readTasks()

    const taskIndex = data.tasks.findIndex((t) => t.id === params.id)
    if (taskIndex === -1) {
      return NextResponse.json({ error: 'タスクが見つかりません' }, { status: 404 })
    }

    data.tasks.splice(taskIndex, 1)
    writeTasks(data)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'タスクの削除に失敗しました' }, { status: 500 })
  }
}
