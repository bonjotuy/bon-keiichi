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
  const [filterProject, setFilterProject] = useState<string>('すべて')
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('未完了')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tasks').then(r => r.json()).then(data => {
      setTasks(data.tasks || [])
      setLoading(false)
    })
  }, [])

  const activeTasks = tasks.filter(t => t.type === 'task' && !t.deleted)

  // 人フィルター適用後のアクティブタスク（プロジェクト数カウント用）
  const personFiltered = activeTasks.filter(t =>
    filterPerson === '全員' || t.assignee === filterPerson
  )

  // プロジェクト一覧と各プロジェクトの未完了タスク数
  const projectCounts = personFiltered.reduce<Record<string, number>>((acc, t) => {
    if (t.status !== '完了') {
      acc[t.project] = (acc[t.project] || 0) + 1
    }
    return acc
  }, {})
  const projectList = Object.keys(projectCounts).sort()

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
    if (filterProject !== 'すべて' && t.project !== filterProject) return false

    if (filterStatus === '未完了') return t.status === '未着手'
    if (filterStatus === '進行中') return t.status === '進行中'
    if (filterStatus === '完了済み') return t.status === '完了'
    return true
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
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      setTasks(prev => prev.filter(t => t.id !== id))
    } else {
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

  const statusButtons: { label: string; value: StatusFilter }[] = [
    { label: '未完了',    value: '未完了' },
    { label: '進行中',    value: '進行中' },
    { label: '完了済み',  value: '完了済み' },
    { label: '🗑 ゴミ箱', value: 'ゴミ箱' },
    { label: 'すべて',    value: 'すべて' },
  ]

  return (
    <div className="space-y-3">
      {/* 1段目: 人フィルター */}
      <div className="grid grid-cols-3 gap-3">
        {personButtons.map(btn => {
          const isActive = filterPerson === btn.value
          return (
            <button
              key={btn.value}
              onClick={() => { setFilterPerson(btn.value); setFilterProject('すべて') }}
              className={`rounded-2xl p-4 border-2 text-center transition-all shadow-sm ${
                isActive ? personActiveColor[btn.color] : 'bg-white border-gray-100 hover:border-gray-300'
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

      {/* 2段目: プロジェクトフィルター */}
      {filterStatus !== 'ゴミ箱' && (
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterProject('すべて')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filterProject === 'すべて'
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-orange-300'
            }`}
          >
            すべて
          </button>
          {projectList.map(p => (
            <button
              key={p}
              onClick={() => setFilterProject(p)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                filterProject === p
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-orange-300'
              }`}
            >
              {p}
              <span className={`text-xs ${filterProject === p ? 'text-white/80' : 'text-gray-400'}`}>
                {projectCounts[p]}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* 3段目: ステータスフィルター */}
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

      {/* タスク一覧 */}
      {loading ? (
        <div className="text-center text-gray-400 py-16 text-sm">読み込み中...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-400 py-16 text-sm">
          {filterStatus === 'ゴミ箱' ? 'ゴミ箱は空です 🗑' : 'タスクなし 🎉'}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(
            filtered.reduce<Record<string, Task[]>>((acc, t) => {
              const key = t.project || 'その他'
              if (!acc[key]) acc[key] = []
              acc[key].push(t)
              return acc
            }, {})
          ).map(([project, items]) => (
            <div key={project}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-gray-400 tracking-wider">{project}</span>
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-300">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map(task => (
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
            </div>
          ))}
        </div>
      )}

      {filterStatus !== 'ゴミ箱' && (
        <TaskForm onAdd={handleAdd} projects={projects} defaultType="task" />
      )}
    </div>
  )
}
