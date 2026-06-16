'use client'

import { useState } from 'react'
import { Task, Status } from '@/types/task'

interface TaskCardProps {
  task: Task
  onStatusChange: (id: string, status: Status) => void
  onDelete: (id: string) => void
  onRestore?: (id: string) => void
  onDueDateChange: (id: string, dueDate: string | null) => void
  isTrash?: boolean
}

const priorityDot: Record<string, string> = {
  '高': 'bg-red-400',
  '中': 'bg-yellow-400',
  '低': 'bg-green-400',
}

function getDueDateColor(dueDate: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'text-red-500'
  if (diffDays <= 3) return 'text-orange-500'
  return 'text-gray-400'
}

const statusConfig: { value: Status; label: string; active: string; inactive: string }[] = [
  { value: '未着手', label: '未完了', active: 'bg-gray-100 text-gray-700 font-semibold', inactive: 'text-gray-300 hover:text-gray-400 hover:bg-gray-50' },
  { value: '進行中', label: '進行中', active: 'bg-blue-100 text-blue-700 font-semibold', inactive: 'text-gray-300 hover:text-blue-400 hover:bg-blue-50' },
  { value: '完了',   label: '完了',   active: 'bg-green-100 text-green-700 font-semibold', inactive: 'text-gray-300 hover:text-green-400 hover:bg-green-50' },
]

export default function TaskCard({ task, onStatusChange, onDelete, onRestore, onDueDateChange, isTrash }: TaskCardProps) {
  const [editingDue, setEditingDue] = useState(false)
  const isIdea = task.type === 'idea'
  const isDone = task.status === '完了'

  return (
    <div className={`bg-white rounded-xl border transition-all ${isDone ? 'border-gray-100 opacity-70' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}>
      <div className="px-4 py-3 space-y-2">
        {/* Header row */}
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              {!isIdea && <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${priorityDot[task.priority]}`} />}
              {isIdea && <span className="text-base">💡</span>}
              <span className={`text-sm font-semibold ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                {task.title}
              </span>
            </div>
            {task.description && (
              <p className="text-xs text-gray-400 ml-4">{task.description}</p>
            )}
            <div className="flex items-center gap-2 ml-4 mt-1 flex-wrap">
              <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-md">{task.assignee}</span>
              {!isIdea && (
                editingDue ? (
                  <input
                    type="date"
                    defaultValue={task.dueDate || ''}
                    autoFocus
                    className="border border-orange-300 rounded px-1.5 py-0.5 text-xs focus:outline-none"
                    onChange={e => onDueDateChange(task.id, e.target.value || null)}
                    onBlur={() => setEditingDue(false)}
                  />
                ) : (
                  <button
                    onClick={() => setEditingDue(true)}
                    className={`text-xs font-medium ${task.dueDate ? getDueDateColor(task.dueDate) : 'text-gray-300 hover:text-gray-400'}`}
                  >
                    {task.dueDate ? `期限: ${task.dueDate}` : '＋期限'}
                  </button>
                )
              )}
            </div>
          </div>
          {/* Delete / Restore buttons */}
          {isTrash ? (
            <div className="flex items-center gap-1 shrink-0">
              {onRestore && (
                <button
                  onClick={() => onRestore(task.id)}
                  className="text-xs text-blue-400 hover:text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  元に戻す
                </button>
              )}
              <button
                onClick={() => onDelete(task.id)}
                className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
              >
                完全削除
              </button>
            </div>
          ) : (
            <button
              onClick={() => onDelete(task.id)}
              className="text-gray-300 hover:text-red-400 p-1 rounded-lg hover:bg-red-50 transition-colors shrink-0"
              title="ゴミ箱へ"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        {/* Status buttons (task only, not in trash) */}
        {!isIdea && !isTrash && (
          <div className="flex items-center gap-1 pt-2 border-t border-gray-100">
            {statusConfig.map(s => (
              <button
                key={s.value}
                onClick={() => onStatusChange(task.id, s.value)}
                className={`px-3 py-1 rounded-lg text-xs transition-all ${task.status === s.value ? s.active : s.inactive}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
