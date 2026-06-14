'use client'

import { useState } from 'react'
import { Task } from '@/types/task'

interface ExtractedTask {
  title: string
  description: string
  assignee: Task['assignee']
  project: string
  priority: Task['priority']
}

export default function ImportPage() {
  const [transcript, setTranscript] = useState('')
  const [extracted, setExtracted] = useState<ExtractedTask[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const analyze = async () => {
    if (!transcript.trim()) return
    setLoading(true)
    setError('')
    setExtracted([])
    setSelected(new Set())
    try {
      const res = await fetch('/api/analyze-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'エラーが発生しました')
      setExtracted(data.tasks || [])
      setSelected(new Set((data.tasks || []).map((_: unknown, i: number) => i)))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (i: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const saveSelected = async () => {
    const tasks = extracted.filter((_, i) => selected.has(i))
    if (tasks.length === 0) return
    setSaving(true)
    setError('')
    try {
      await Promise.all(tasks.map(task =>
        fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...task, status: '未着手' }),
        })
      ))
      setSuccess(`${tasks.length}件のタスクを追加しました！`)
      setExtracted([])
      setTranscript('')
      setSelected(new Set())
    } catch {
      setError('タスクの保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const priorityColors: Record<string, string> = {
    '高': 'bg-red-100 text-red-700',
    '中': 'bg-yellow-100 text-yellow-700',
    '低': 'bg-green-100 text-green-700',
  }

  const assigneeEmoji: Record<string, string> = {
    'ボンちゃん': '🎸',
    '杉浦さん': '🎯',
    '両方': '🎸🎯',
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">🎙️ ミーティング文字起こし取り込み</h1>
        <p className="text-sm text-gray-500 mt-1">Google Meetの文字起こしを貼り付けると、AIがタスクを自動抽出します</p>
      </div>

      {error && <div className="bg-red-50 text-red-700 rounded-xl p-3 text-sm">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 rounded-xl p-3 text-sm">{success}</div>}

      {extracted.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-4 space-y-3">
          <textarea
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            placeholder="ここにGoogle Meetの文字起こしテキストを貼り付けてください..."
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 resize-none"
            rows={12}
          />
          <button
            onClick={analyze}
            disabled={loading || !transcript.trim()}
            className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '🤖 AIが分析中...' : '🤖 タスクを自動抽出する'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">{extracted.length}件のタスクが見つかりました</p>
            <button onClick={() => setExtracted([])} className="text-xs text-gray-400 hover:text-gray-600">
              やり直す
            </button>
          </div>
          {extracted.map((task, i) => (
            <div
              key={i}
              onClick={() => toggleSelect(i)}
              className={`bg-white rounded-xl border-l-4 p-4 cursor-pointer transition-all ${
                selected.has(i) ? 'border-orange-400 shadow-sm' : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selected.has(i)}
                  onChange={() => toggleSelect(i)}
                  onClick={e => e.stopPropagation()}
                  className="mt-1 accent-orange-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span>{assigneeEmoji[task.assignee]}</span>
                    <span className="font-semibold text-gray-800 text-sm">{task.title}</span>
                  </div>
                  {task.description && <p className="text-xs text-gray-500 mb-2">{task.description}</p>}
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{task.project}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>優先度: {task.priority}</span>
                    <span className="text-xs text-gray-500">{task.assignee}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={saveSelected}
            disabled={saving || selected.size === 0}
            className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '保存中...' : `✅ 選択した${selected.size}件を追加する`}
          </button>
        </div>
      )}
    </div>
  )
}
