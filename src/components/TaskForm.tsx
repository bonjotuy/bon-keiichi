'use client'
import { useState } from 'react'
import { Task, Assignee, Priority, ItemType } from '@/types/task'

interface Props {
  onAdd: (task: Omit<Task, 'id' | 'createdAt'>) => void
  projects: string[]
  defaultType?: ItemType
}

export default function TaskForm({ onAdd, projects: existingProjects, defaultType = 'task' }: Props) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<ItemType>(defaultType)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignee, setAssignee] = useState<Assignee>('ボンちゃん')
  const [project, setProject] = useState('')
  const [priority, setPriority] = useState<Priority>('中')
  const [error, setError] = useState('')

  const isIdea = type === 'idea'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('タイトルは必須です'); return }
    if (!isIdea && !project.trim()) { setError('プロジェクト名は必須です'); return }
    setError('')
    onAdd({
      type,
      title: title.trim(),
      description: description.trim(),
      assignee,
      project: isIdea ? 'アイデア' : project.trim(),
      priority,
      status: '未着手',
    })
    setTitle(''); setDescription(''); setProject(''); setOpen(false)
  }

  if (!open) return (
    <button
      onClick={() => { setType(defaultType); setOpen(true) }}
      className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-all text-sm font-medium"
    >
      ＋ {defaultType === 'idea' ? 'アイデアを追加' : 'タスクを追加'}
    </button>
  )

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
      {error && <div className="text-red-600 text-sm bg-red-50 rounded-lg p-2">{error}</div>}

      <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
        <button type="button" onClick={() => setType('task')}
          className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${type === 'task' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
          ✅ タスク
        </button>
        <button type="button" onClick={() => setType('idea')}
          className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${type === 'idea' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
          💡 アイデア
        </button>
      </div>

      <input value={title} onChange={e => setTitle(e.target.value)} placeholder={isIdea ? 'アイデア名 *' : 'タスク名 *'}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" required />
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="詳細（任意）"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 resize-none" rows={2} />

      <div className="flex gap-2 flex-wrap">
        <select value={assignee} onChange={e => setAssignee(e.target.value as Assignee)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 bg-white">
          <option value="ボンちゃん">🎸 ボンちゃん</option>
          <option value="杉浦さん">🎯 杉浦さん</option>
          <option value="両方">🎸🎯 両方</option>
        </select>
        {!isIdea && (
          <>
            <select value={priority} onChange={e => setPriority(e.target.value as Priority)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 bg-white">
              <option value="高">🔴 高</option>
              <option value="中">🟡 中</option>
              <option value="低">🟢 低</option>
            </select>
            <input value={project} onChange={e => setProject(e.target.value)} placeholder="プロジェクト名 *"
              list="projects" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 flex-1 min-w-32" />
            <datalist id="projects">{existingProjects.map(p => <option key={p} value={p} />)}</datalist>
          </>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-gray-600">キャンセル</button>
        <button type="submit" className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium">追加</button>
      </div>
    </form>
  )
}
