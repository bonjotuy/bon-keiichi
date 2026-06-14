'use client'

import { Task, Status } from '@/types/task'

interface TaskCardProps {
  task: Task
  onStatusChange: (id: string, status: Status) => void
  onDelete: (id: string) => void
}

const priorityDot: Record<string, string> = {
  '高': 'bg-red-400',
  '中': 'bg-yellow-400',
  '低': 'bg-green-400',
}

const assigneeEmoji: Record<string, string> = {
  'ボンちゃん': '🎸',
  '杉浦さん': '🎯',
  '両方': '🎸🎯',
}

const statusConfig: Record<string, { label: string; color: string }> = {
  '未着手': { label: '未着手', color: 'bg-gray-100 text-gray-500' },
  '進行中': { label: '進行中', color: 'bg-blue-50 text-blue-600' },
  '完了': { label: '完了', color: 'bg-green-50 text-green-600' },
}

const statusOrder: Status[] = ['未着手', '進行中', '完了']

export default function TaskCard({ task, onStatusChange, onDelete }: TaskCardProps) {
  const isDone = task.status === '完了'
  const isIdea = task.type === 'idea'
  const nextStatus = statusOrder[(statusOrder.indexOf(task.status) + 1) % statusOrder.length]

  return (
    <div className={`bg-white rounded-xl border transition-all ${isDone ? 'border-gray-100 opacity-60' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}>
      <div className="flex items-stretch">
        {/* Complete button (left side) */}
        {!isIdea ? (
          <button
            onClick={() => onStatusChange(task.id, isDone ? '未着手' : '完了')}
            className={`flex items-center justify-center w-12 rounded-l-xl transition-all shrink-0 border-r ${
              isDone
                ? 'bg-green-50 text-green-500 border-green-100 hover:bg-red-50 hover:text-red-400'
                : 'bg-gray-50 text-gray-300 border-gray-100 hover:bg-green-50 hover:text-green-500'
            }`}
            title={isDone ? '未着手に戻す' : '完了にする'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
          </button>
        ) : (
          <div className="flex items-center justify-center w-12 rounded-l-xl bg-purple-50 border-r border-purple-100 shrink-0">
            <span className="text-lg">💡</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 px-3 py-3 min-w-0">
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${priorityDot[task.priority]}`} />
                <span className={`text-sm font-semibold ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {task.title}
                </span>
              </div>
              {task.description && (
                <p className="text-xs text-gray-400 ml-4 mb-1">{task.description}</p>
              )}
              <div className="flex items-center gap-2 ml-4 flex-wrap">
                <span className="text-xs text-gray-400">{assigneeEmoji[task.assignee]} {task.assignee}</span>
                {!isIdea && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig[task.status].color}`}>
                    {statusConfig[task.status].label}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              {!isIdea && !isDone && (
                <button
                  onClick={() => onStatusChange(task.id, nextStatus)}
                  className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-50 whitespace-nowrap"
                >
                  → {nextStatus}
                </button>
              )}
              <button
                onClick={() => onDelete(task.id)}
                className="text-gray-300 hover:text-red-400 p-1 rounded-lg hover:bg-red-50 transition-colors"
                title="削除"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
