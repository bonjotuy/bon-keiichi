'use client'
import { useState } from 'react'
import { Task, Assignee, Priority, ItemType } from '@/types/task'
import { PROJECTS } from '@/lib/projects'

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
  const [assignee, setAssignee] = useState<Assignee>('ぼんちゃん')
  const [project, setProject] = useState<string>(PROJECTS[0])
  const [isNewProject, setIsNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [priority, setPriority] = useState<Priority>('中')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState('')

  // 既存プロジェクト（固定リスト＋タスクから動的に追加されたもの）
  const allProjects = [...new Set([...PROJECTS, ...existingProjects])].filter(Boolean)

  const isIdea = type === 'idea'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('タイトルは必須です'); return }
    if (!isIdea && !project) { setError('プロジェクト名は必須です'); return }
    setError('')
    const finalProject = isIdea ? 'アイデア' : (isNewProject ? newProjectName.trim() : project)
    if (!isIdea && isNewProject && !newProjectName.trim()) { setError('プロジェクト名を入力してください'); return }
    onAdd({
      type,
      title: title.trim(),
      description: description.trim(),
      assignee,
      project: finalProject,
      priority,
      status: '未着手',
      dueDate: dueDate || undefined,
      deleted: false,
    })
    setTitle(''); setDescription(''); setProject(PROJECTS[0] as string); setNewProjectName(''); setIsNewProject(false); setDueDate(''); setOpen(false)
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
          <option value="ぼんちゃん">ぼんちゃん</option>
          <option value="恵一">恵一</option>
        </select>
        {!isIdea && (
          <>
            <select value={priority} onChange={e => setPriority(e.target.value as Priority)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 bg-white">
              <option value="高">🔴 高</option>
              <option value="中">🟡 中</option>
              <option value="低">🟢 低</option>
            </select>
            {isNewProject ? (
              <div className="flex gap-1 flex-1">
                <input
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  placeholder="新しいプロジェクト名"
                  autoFocus
                  className="border border-orange-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 flex-1"
                />
                <button type="button" onClick={() => { setIsNewProject(false); setNewProjectName('') }}
                  className="text-xs text-gray-400 hover:text-gray-600 px-2">✕</button>
              </div>
            ) : (
              <select
                value={project}
                onChange={e => { if (e.target.value === '__new__') { setIsNewProject(true) } else { setProject(e.target.value) } }}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 bg-white flex-1"
              >
                {allProjects.map(p => <option key={p} value={p}>{p}</option>)}
                <option value="__new__">＋ 新規プロジェクト...</option>
              </select>
            )}
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-400 whitespace-nowrap">期限</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
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
