'use client'
import { useEffect, useState } from 'react'
import { Task, ItemType } from '@/types/task'
import TaskCard from '@/components/TaskCard'
import TaskForm from '@/components/TaskForm'

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTab, setActiveTab] = useState<ItemType>('task')
  const [filterAssignee, setFilterAssignee] = useState<string>('全員')
  const [filterStatus, setFilterStatus] = useState<string>('未完了')
  const [sortBy, setSortBy] = useState<'追加順' | '期限順'>('追加順')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tasks').then(r => r.json()).then(data => { setTasks(data.tasks || []); setLoading(false) })
  }, [])

  const projects = [...new Set(tasks.filter(t => t.type === 'task').map(t => t.project))]

  const filtered = tasks.filter(t => {
    if (t.type !== activeTab) return false
    if (activeTab === 'idea') return true
    if (filterAssignee !== '全員' && t.assignee !== filterAssignee) return false
    if (filterStatus === '未完了' && t.status === '完了') return false
    if (filterStatus === '完了のみ' && t.status !== '完了') return false
    return true
  })

  const grouped = filtered.reduce<Record<string, Task[]>>((acc, t) => {
    const key = t.project || 'その他'
    if (!acc[key]) acc[key] = []
    acc[key].push(t)
    return acc
  }, {})

  const bonCount = tasks.filter(t => t.type === 'task' && t.assignee === 'ボンちゃん' && t.status !== '完了').length
  const sugCount = tasks.filter(t => t.type === 'task' && t.assignee === '杉浦さん' && t.status !== '完了').length
  const ideaCount = tasks.filter(t => t.type === 'idea').length

  const handleAdd = async (task: Omit<Task, 'id' | 'createdAt'>) => {
    const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(task) })
    const newTask = await res.json()
    setTasks(prev => [newTask, ...prev])
  }

  const handleStatusChange = async (id: string, status: Task['status']) => {
    await fetch(`/api/tasks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-xl mb-1">🎸</div>
          <div className="text-2xl font-bold text-orange-500">{bonCount}</div>
          <div className="text-xs text-gray-400 mt-0.5">ボンちゃん</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-xl mb-1">🎯</div>
          <div className="text-2xl font-bold text-blue-500">{sugCount}</div>
          <div className="text-xs text-gray-400 mt-0.5">杉浦さん</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-xl mb-1">💡</div>
          <div className="text-2xl font-bold text-purple-500">{ideaCount}</div>
          <div className="text-xs text-gray-400 mt-0.5">アイデア</div>
        </div>
      </div>

      {/* Tab */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        <button
          onClick={() => setActiveTab('task')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'task' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
        >
          ✅ タスク
        </button>
        <button
          onClick={() => setActiveTab('idea')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'idea' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
        >
          💡 アイデア
        </button>
      </div>

      {/* Filters (task only) */}
      {activeTab === 'task' && (
        <div className="flex gap-2 flex-wrap">
          {['全員', 'ボンちゃん', '杉浦さん'].map(a => (
            <button key={a} onClick={() => setFilterAssignee(a)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${filterAssignee === a ? 'bg-orange-500 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-orange-300'}`}>
              {a}
            </button>
          ))}
          <span className="border-l border-gray-200 mx-1" />
          {['未完了', '完了のみ', '全て'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${filterStatus === s ? 'bg-gray-700 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'}`}>
              {s}
            </button>
          ))}
          <span className="border-l border-gray-200 mx-1" />
          {(['追加順', '期限順'] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${sortBy === s ? 'bg-blue-500 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-300'}`}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center text-gray-400 py-16 text-sm">読み込み中...</div>
      ) : (
        <div className="space-y-6">
          {Object.keys(grouped).length === 0 && (
            <div className="text-center text-gray-400 py-16 text-sm">
              {activeTab === 'task' ? 'タスクなし 🎉' : 'アイデアなし 💡'}
            </div>
          )}
          {Object.entries(grouped).map(([project, items]) => (
            <div key={project}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{project}</span>
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-300">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items
                  .sort((a, b) => {
                    if (sortBy === '期限順') {
                      if (!a.dueDate && !b.dueDate) return 0
                      if (!a.dueDate) return 1
                      if (!b.dueDate) return -1
                      return a.dueDate.localeCompare(b.dueDate)
                    }
                    return ({ '高': 0, '中': 1, '低': 2 }[a.priority] ?? 1) - ({ '高': 0, '中': 1, '低': 2 }[b.priority] ?? 1)
                  })
                  .map(task => (
                    <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} onDelete={handleDelete} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskForm onAdd={handleAdd} projects={projects} defaultType={activeTab} />
    </div>
  )
}
