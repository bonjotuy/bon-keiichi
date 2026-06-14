'use client'
import { useEffect, useState } from 'react'
import { Task } from '@/types/task'

const priorityOrder = { '高': 0, '中': 1, '低': 2 }

export default function MeetingPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - today.getDay() + 1)

  useEffect(() => {
    fetch('/api/tasks').then(r => r.json()).then(data => setTasks(data.tasks || []))
  }, [])

  const urgent = tasks.filter(t => t.status !== '完了' && t.priority === '高').sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  const inProgress = tasks.filter(t => t.status === '進行中')
  const thisWeek = tasks.filter(t => new Date(t.createdAt) >= monday && t.status !== '完了')

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📋 月曜ミーティング</h2>
        <p className="text-gray-500 text-sm mt-1">{today.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
      </div>

      <section className="mb-6">
        <h3 className="font-bold text-red-600 mb-3 flex items-center gap-2">🔥 優先度高 — 今すぐ話すこと</h3>
        {urgent.length === 0 ? <p className="text-gray-400 text-sm">緊急タスクなし！いい感じです</p> : (
          <div className="space-y-2">
            {urgent.map(t => (
              <div key={t.id} className="bg-white border-l-4 border-red-400 rounded-r-xl p-3 shadow-sm">
                <div className="text-xs text-gray-400 mb-0.5">{t.assignee} • {t.project}</div>
                <div className="font-semibold text-gray-800">{t.title}</div>
                {t.description && <div className="text-sm text-gray-500 mt-0.5">{t.description}</div>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-6">
        <h3 className="font-bold text-blue-600 mb-3">⚡ 進行中タスクの確認</h3>
        {inProgress.length === 0 ? <p className="text-gray-400 text-sm">進行中タスクなし</p> : (
          <div className="space-y-2">
            {inProgress.map(t => (
              <div key={t.id} className="bg-white border-l-4 border-blue-400 rounded-r-xl p-3 shadow-sm">
                <div className="text-xs text-gray-400 mb-0.5">{t.assignee} • {t.project}</div>
                <div className="font-semibold text-gray-800">{t.title}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-6">
        <h3 className="font-bold text-purple-600 mb-3">🆕 今週追加されたタスク</h3>
        {thisWeek.length === 0 ? <p className="text-gray-400 text-sm">今週の新規タスクなし</p> : (
          <div className="space-y-2">
            {thisWeek.map(t => (
              <div key={t.id} className="bg-white border-l-4 border-purple-400 rounded-r-xl p-3 shadow-sm">
                <div className="text-xs text-gray-400 mb-0.5">{t.assignee} • {t.project}</div>
                <div className="font-semibold text-gray-800">{t.title}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-center">
        <p className="text-orange-600 font-medium">合計 {tasks.filter(t => t.status !== '完了').length} 件の未完了タスク</p>
        <p className="text-xs text-gray-400 mt-1">完了済み: {tasks.filter(t => t.status === '完了').length} 件</p>
      </div>
    </div>
  )
}
