'use client'

import { Task, Status } from '@/types/task'

interface TaskCardProps {
  task: Task
  onStatusChange: (id: string, status: Status) => void
  onDelete: (id: string) => void
}

const priorityColors: Record<string, string> = {
  '高': 'bg-red-100 text-red-700 border-red-200',
  '中': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  '低': 'bg-green-100 text-green-700 border-green-200',
}

const statusColors: Record<string, string> = {
  '未着手': 'bg-gray-100 text-gray-600',
  '進行中': 'bg-blue-100 text-blue-700',
  '完了': 'bg-green-100 text-green-700',
}

const assigneeEmoji: Record<string, string> = {
  'ボンちゃん': '🎸',
  '杉浦さん': '🎯',
  '両方': '🎸🎯',
}

const statusOrder: Status[] = ['未着手', '進行中', '完了']

export default function TaskCard({ task, onStatusChange, onDelete }: TaskCardProps) {
  const nextStatus = statusOrder[(statusOrder.indexOf(task.status) + 1) % statusOrder.length]

  return (
    <div className={`bg-white rounded-xl shadow-sm border-l-4 p-4 hover:shadow-md transition-shadow ${
      task.status === '完了' ? 'border-green-400 opacity-75' : 'border-orange-400'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-lg">{assigneeEmoji[task.assignee]}</span>
            <h3 className={`font-semibold text-gray-800 ${task.status === '完了' ? 'line-through text-gray-400' : ''}`}>
              {task.title}
            </h3>
          </div>
          {task.description && (
            <p className="text-sm text-gray-500 mt-1 mb-2">{task.description}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
              {task.project}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColors[task.priority]}`}>
              優先度: {task.priority}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[task.status]}`}>
              {task.status}
            </span>
            <span className="text-xs text-gray-400">
              {task.assignee}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          <button
            onClick={() => onStatusChange(task.id, nextStatus)}
            className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-2 py-1 rounded-lg transition-colors whitespace-nowrap"
          >
            → {nextStatus}
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-xs bg-red-50 hover:bg-red-100 text-red-500 px-2 py-1 rounded-lg transition-colors"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  )
}
