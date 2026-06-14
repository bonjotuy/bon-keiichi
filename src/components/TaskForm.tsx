'use client'
import { useState } from 'react'
import { Task, Assignee, Priority } from '@/types/task'

interface Props {
  onAdd: (task: Omit<Task, 'id' | 'createdAt'>) => void
  projects: string[]
}

export default function TaskForm({ onAdd, projects: existingProjects }: Props) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignee, setAssignee] = useState<Assignee>('ボンちゃん')
  const [project, setProject] = useState('')
  const [priority, setPriority] = useState<Priority>('中')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !project.trim()) {
      setError('タイトルとプロジェクト名は必須です')
      return
    }
    setError('')
    onAdd({ title: title.trim(), description: description.trim(), assignee, project: project.trim(), priority, status: '未着手' })
    setTitle(''); setDescription(''); setProject(''); setOpen(false)
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} className="w-full py-3 border-2 border-dashed border-orange-200 rounded-xl text-orange-400 hover:border-orange-400 hover:text-orange-600 transition-all font-medium">
      ＋ タスクを追加
    </button>
  )

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-orange-100 p-4 space-y-3">
      {error && <div className="text-red-600 text-sm bg-red-50 rounded-lg p-2">{error}</div>}
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="タスク名 *" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" required />
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="詳細（任意）" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 resize-none" rows={2} />
      <div className="flex gap-2 flex-wrap">
        <select value={assignee} onChange={e => setAssignee(e.target.value as Assignee)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400">
          <option value="ボンちゃん">🎸 ボンちゃん</option>
          <option value="杉浦さん">🎯 杉浦さん</option>
          <option value="両方">🎸🎯 両方</option>
        </select>
        <select value={priority} onChange={e => setPriority(e.target.value as Priority)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400">
          <option value="高">🔴 高</option>
          <option value="中">🟡 中</option>
          <option value="低">🟢 低</option>
        </select>
        <input value={project} onChange={e => setProject(e.target.value)} placeholder="プロジェクト名 *" list="projects" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" required />
        <datalist id="projects">{existingProjects.map(p => <option key={p} value={p} />)}</datalist>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">キャンセル</button>
        <button type="submit" className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium">追加</button>
      </div>
    </form>
  )
}
