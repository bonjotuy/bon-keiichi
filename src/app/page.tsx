'use client'
import { useEffect, useState } from 'react'
import { Task } from '@/types/task'
import TaskCard from '@/components/TaskCard'
import TaskForm from '@/components/TaskForm'

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filterAssignee, setFilterAssignee] = useState<string>('全員')
  const [filterProject, setFilterProject] = useState<string>('全て')
  const [filterStatus, setFilterStatus] = useState<string>('未完了')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tasks').then(r => r.json()).then(data => { setTasks(data); setLoading(false) })
  }, [])

  const projects = [...new Set(tasks.map(t => t.project))]

  const filtered = tasks.filter(t => {
    if (filterAssignee !== '全員' && t.assignee !== filterAssignee) return false
    if (filterProject !== '全て' && t.project !== filterProject) return false
    if (filterStatus === '未完了' && t.status === '完了') return false
    if (filterStatus === '完了のみ' && t.status !== '完了') return false
    return true
  })

  const bonCount = tasks.filter(t => t.assignee === 'ボンちゃん' && t.status !== '完了').length
  const sugCount = tasks.filter(t => t.assignee === '両方' || t.assignee === '杉浦さん').filter(t => t.status !== '完了').length

  const handleAdd = async (task: Omit<Task, 'id' | 'createdAt'>) => {
    const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(task) })
    const newTask = await res.json()
    setTasks(prev => [...prev, newTask])
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
    <div>
      <div className="flex gap-4 mb-6">
        <div className="flex-1 bg-white rounded-xl p-4 shadow-sm border text-center">
          <div className="text-2xl">🎸</div>
          <div className="font-bold text-gray-700">ボンちゃん</div>
          <div className="text-3xl font-bold text-orange-500">{bonCount}</div>
          <div className="text-xs text-gray-400">残タスク</div>
        </div>
        <div className="flex-1 bg-white rounded-xl p-4 shadow-sm border text-center">
          <div className="text-2xl">🎯</div>
          <div className="font-bold text-gray-700">杉浦さん</div>
          <div className="text-3xl font-bold text-blue-500">{sugCount}</div>
          <div className="text-xs text-gray-400">残タスク</div>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {['全員', 'ボンちゃん', '杉浦さん', '両方'].map(a => (
          <button key={a} onClick={() => setFilterAssignee(a)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${filterAssignee === a ? 'bg-orange-500 text-white' : 'bg-white text-gray-500 hover:bg-orange-50'}`}>{a}</button>
        ))}
        <span className="border-l border-gray-200 mx-1" />
        {['未完了', '完了のみ', '全て'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${filterStatus === s ? 'bg-gray-700 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>{s}</button>
        ))}
        {projects.length > 0 && <>
          <span className="border-l border-gray-200 mx-1" />
          <select value={filterProject} onChange={e => setFilterProject(e.target.value)} className="px-3 py-1.5 rounded-full text-sm bg-white border text-gray-500">
            <option>全て</option>
            {projects.map(p => <option key={p}>{p}</option>)}
          </select>
        </>}
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-10">読み込み中...</div>
      ) : (
        <div className="space-y-3">
          {filtered.sort((a, b) => {
            const pOrder = { '高': 0, '中': 1, '低': 2 }
            return pOrder[a.priority] - pOrder[b.priority]
          }).map(task => (
            <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} onDelete={handleDelete} />
          ))}
          {filtered.length === 0 && <div className="text-center text-gray-400 py-10">タスクがありません 🎉</div>}
        </div>
      )}

      <div className="mt-4">
        <TaskForm onAdd={handleAdd} projects={projects} />
      </div>
    </div>
  )
}
