'use client'

import { useState, useRef } from 'react'
import { Task, ItemType } from '@/types/task'
import { PROJECTS } from '@/lib/projects'

interface ExtractedTask {
  title: string
  description: string
  assignee: Task['assignee']
  project: string
  priority: Task['priority']
  type: ItemType
  dueDate?: string | null
}

export default function ImportPage() {
  const [transcript, setTranscript] = useState('')
  const [extracted, setExtracted] = useState<ExtractedTask[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState('')
  const [fileLoading, setFileLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/extract-text', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'ファイルの読み込みに失敗しました')
      setTranscript(data.text)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ファイルの読み込みに失敗しました')
    } finally {
      setFileLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const splitIntoChunks = (text: string, maxChars = 10000): string[] => {
    if (text.length <= maxChars) return [text]
    const chunks: string[] = []
    let remaining = text
    while (remaining.length > 0) {
      if (remaining.length <= maxChars) {
        chunks.push(remaining)
        break
      }
      // try to split at a newline boundary
      let splitAt = remaining.lastIndexOf('\n', maxChars)
      if (splitAt < maxChars * 0.5) splitAt = maxChars
      chunks.push(remaining.slice(0, splitAt))
      remaining = remaining.slice(splitAt).trimStart()
    }
    return chunks
  }

  const analyze = async () => {
    if (!transcript.trim()) return
    setLoading(true)
    setLoadingProgress('')
    setError('')
    setExtracted([])
    setSelected(new Set())
    try {
      const chunks = splitIntoChunks(transcript.trim())
      const allTasks: ExtractedTask[] = []

      for (let i = 0; i < chunks.length; i++) {
        if (chunks.length > 1) {
          setLoadingProgress(`分割処理中 (${i + 1}/${chunks.length})...`)
        }
        const res = await fetch('/api/analyze-transcript', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: chunks[i] }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'エラーが発生しました')
        allTasks.push(...(data.tasks || []))
      }

      // deduplicate by title
      const seen = new Set<string>()
      const deduped = allTasks.filter(t => {
        if (seen.has(t.title)) return false
        seen.add(t.title)
        return true
      })

      setExtracted(deduped)
      setSelected(new Set(deduped.map((_, i) => i)))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
      setLoadingProgress('')
    }
  }

  const toggleSelect = (i: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const updateTask = (i: number, updates: Partial<ExtractedTask>) => {
    setExtracted(prev => prev.map((t, idx) => idx === i ? { ...t, ...updates } : t))
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
          body: JSON.stringify({ ...task, status: '未着手', dueDate: task.dueDate || null }),
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

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">ミーティング文字起こし取り込み</h1>
        <p className="text-sm text-gray-500 mt-1">Google Meetの文字起こしを貼り付けると、AIがタスクを自動抽出します</p>
      </div>

      {error && <div className="bg-red-50 text-red-700 rounded-xl p-3 text-sm">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 rounded-xl p-3 text-sm">{success}</div>}

      {extracted.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-4 space-y-3">
          {/* File upload */}
          <div
            className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-orange-300 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.text"
              className="hidden"
              onChange={handleFileUpload}
            />
            {fileLoading ? (
              <p className="text-sm text-orange-500">ファイルを読み込み中...</p>
            ) : (
              <>
                <p className="text-sm text-gray-400">PDFまたはテキストファイルをアップロード</p>
                <p className="text-xs text-gray-300 mt-1">.pdf / .txt に対応</p>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-300">
            <div className="flex-1 h-px bg-gray-100" />
            または テキストを直接貼り付け
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <textarea
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            placeholder="ここにGoogle Meetの文字起こしテキストを貼り付けてください..."
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 resize-none"
            rows={8}
          />
          <button
            onClick={analyze}
            disabled={loading || !transcript.trim()}
            className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (loadingProgress || 'AIが分析中...') : 'タスクを自動抽出する'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">{extracted.length}件が見つかりました</p>
            <button onClick={() => setExtracted([])} className="text-xs text-gray-400 hover:text-gray-600">
              やり直す
            </button>
          </div>
          {extracted.map((task, i) => (
            <div
              key={i}
              className={`bg-white rounded-xl border-l-4 p-4 transition-all ${
                selected.has(i) ? 'border-orange-400 shadow-sm' : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selected.has(i)}
                  onChange={() => toggleSelect(i)}
                  className="mt-1 accent-orange-500"
                />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Type toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
                      <button
                        type="button"
                        onClick={() => updateTask(i, { type: 'task' })}
                        className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${task.type === 'task' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}
                      >
                        タスク
                      </button>
                      <button
                        type="button"
                        onClick={() => updateTask(i, { type: 'idea' })}
                        className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${task.type === 'idea' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}
                      >
                        アイデア
                      </button>
                    </div>
                    <span className="font-semibold text-gray-800 text-sm">{task.title}</span>
                  </div>
                  {task.description && <p className="text-xs text-gray-500">{task.description}</p>}
                  <div className="flex gap-2 flex-wrap items-center">
                    <select
                      value={task.project}
                      onChange={e => updateTask(i, { project: e.target.value })}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-orange-400"
                    >
                      {PROJECTS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>優先度: {task.priority}</span>
                    <select
                      value={task.assignee}
                      onChange={e => updateTask(i, { assignee: e.target.value as Task['assignee'] })}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-orange-400"
                    >
                      <option value="ぼんちゃん">ぼんちゃん</option>
                      <option value="恵一">恵一</option>
                    </select>
                  </div>
                  {/* Due date input */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-400">期限:</label>
                    <input
                      type="date"
                      value={task.dueDate || ''}
                      onChange={e => updateTask(i, { dueDate: e.target.value || null })}
                      className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-orange-400"
                    />
                    {task.dueDate && (
                      <button
                        type="button"
                        onClick={() => updateTask(i, { dueDate: null })}
                        className="text-xs text-gray-300 hover:text-gray-500"
                      >
                        ×
                      </button>
                    )}
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
            {saving ? '保存中...' : `選択した${selected.size}件を追加する`}
          </button>
        </div>
      )}
    </div>
  )
}
