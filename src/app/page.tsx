'use client'
import { useEffect, useState } from 'react'
import { Task, Status } from '@/types/task'
import TaskCard from '@/components/TaskCard'
import TaskForm from '@/components/TaskForm'

type PersonFilter = 'ぼんちゃん' | '恵一' | '全員'
type StatusFilter = '未完了' | '進行中' | '完了済み' | 'ゴミ箱' | 'すべて'

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filterPerson, setFilterPerson] = useState<PersonFilter>('全員')
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('未完了')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tasks').then(r => r.json()).then(data => {
      setTasks(data.tasks || [])
      setLoading(false)
    })
  }, [])

  const activeTasks = tasks.filter(t => t.type === 'task' && !t.deleted)

  const bonCount = activeTasks.filter(t => t.assignee === 'ぼんちゃん' && t.status !== '完了').length
  const keiCount = activeTasks.filter(t => t.assignee === '恵一' && t.status !== '完了').length
  const allCount = activeTasks.filter(t => t.status !== '完了').length

  const filtered = tasks.filter(t => {
    if (t.type !== 'task') return false

    if (filterStatus === 'ゴミ箱') {
      if (!t.deleted) return false
      if (filterPerson !== '全員' && t.assignee !== filterPerson) return false
      return true
    }

    if (t.deleted) return false
    if (filterPerson !== '全員' && t.assignee !== filterPerson) return false

    if (filterStatus === '未完了') return t.status === '未着手'
    if (filterStatus === '進行中') return t.status === '進行中'
    if (filterStatus === '完了済み') return t.status === '完了'
    return true // すべて
  })

  const projects = [...new Set(activeTasks.map(t => t.project))]

  const handleAdd = async (task: Omit<Task, 'id' | 'createdAt'>) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    })
    const newTask = await res.json()
    setTasks(prev => [newTask, ...prev])
  }

  const handleStatusChange = async (id: string, status: Status) => {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
  }

  const handleDelete = async (id: string) => {
    if (filterStatus === 'ゴミ箱') {
      // 永久削除
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      setTasks(prev => prev.filter(t => t.id !== id))
    } else {
      // ゴミ箱へ
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deleted: true }),
      })
      setTasks(prev => prev.map(t => t.id === id ? { ...t, deleted: true } : t))
    }
  }

  const handleRestore = async (id: string) => {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deleted: false }),
    })
    setTasks(prev => prev.map(t => t.id === id ? { ...t, deleted: false } : t))
  }

  const handleUpdate = async (id: string, updates: Partial<Task>) => {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  const handleDueDateChange = async (id: string, dueDate: string | null) => {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dueDate }),
    })
    setTasks(prev => prev.map(t => t.id === id ? { ...t, dueDate: dueDate || undefined } : t))
  }

  const personButtons: { label: string; value: PersonFilter; count: number; color: string }[] = [
    { label: 'ぼんちゃん', value: 'ぼんちゃん', count: bonCount, color: 'orange' },
    { label: '恵一',       value: '恵一',       count: keiCount, color: 'blue' },
    { label: '全員',       value: '全員',       count: allCount, color: 'gray' },
  ]

  const statusButtons: { label: string; value: StatusFilter }[] = [
    { label: '未完了',  value: '未完了' },
    { label: '進行中',  value: '進行中' },
    { label: '完了済み', value: '完了済み' },
    { label: '🗑 ゴミ箱', value: 'ゴミ箱' },
    { label: 'すべて',  value: 'すべて' },
  ]

  const personActiveColor: Record<string, string> = {
    orange: 'bg-orange-500 text-white border-orange-500',
    blue:   'bg-blue-500 text-white border-blue-500',
    gray:   'bg-gray-700 text-white border-gray-700',
  }
  const personCountColor: Record<string, string> = {
    orange: 'text-orange-500',
    blue:   'text-blue-500',
    gray:   'text-gray-700',
  }

  return (
    <div className="space-y-4">
      {/* Person filter buttons */}
      <div className="grid grid-cols-3 gap-3">
        {personButtons.map(btn => {
          const isActive = filterPerson === btn.value
          return (
            <button
              key={btn.value}
              onClick={() => setFilterPerson(btn.value)}
              className={`rounded-2xl p-4 border-2 text-center transition-all shadow-sm ${
                isActive
                  ? personActiveColor[btn.color]
                  : 'bg-white border-gray-100 hover:border-gray-300'
              }`}
            >
              <div className={`text-2xl font-bold ${isActive ? 'text-white' : personCountColor[btn.color]}`}>
                {btn.count}
              </div>
              <div className={`text-xs mt-0.5 ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                {btn.label}
              </div>
            </button>
          )
        })}
      </div>

      {/* Status filter buttons */}
      <div className="flex gap-1.5 flex-wrap">
        {statusButtons.map(btn => (
          <button
            key={btn.value}
            onClick={() => setFilterStatus(btn.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filterStatus === btn.value
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Task list */}
      {loading ? (
        <div className="text-center text-gray-400 py-16 text-sm">読み込み中...</div>
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center text-gray-400 py-16 text-sm">
              {filterStatus === 'ゴミ箱' ? 'ゴミ箱は空です 🗑' : 'タスクなし 🎉'}
            </div>
          )}
          {filtered.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onRestore={handleRestore}
              onDueDateChange={handleDueDateChange}
              onUpdate={handleUpdate}
              isTrash={filterStatus === 'ゴミ箱'}
            />
          ))}
        </div>
      )}

      {filterStatus !== 'ゴミ箱' && (
        <TaskForm onAdd={handleAdd} projects={projects} defaultType="task" />
      )}
    </div>
  )
}
