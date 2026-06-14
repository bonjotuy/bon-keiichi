import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: NextRequest) {
  const { transcript } = await req.json()
  if (!transcript?.trim()) {
    return NextResponse.json({ error: 'transcript is required' }, { status: 400 })
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not set' }, { status: 500 })
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `あなたはプロジェクト管理アシスタントです。以下はボンちゃん（Yuuto Yamanaka）と杉浦さん（Keiichi Sugiura）のミーティング文字起こしです。

文字起こしからタスクやアイデアを抽出して、以下のJSON形式で返してください。担当者は「ボンちゃん」「杉浦さん」のいずれかを選んでください。

\`\`\`json
{
  "tasks": [
    {
      "title": "タスク名",
      "description": "詳細説明（任意）",
      "assignee": "ボンちゃん" | "杉浦さん",
      "project": "プロジェクト名",
      "priority": "高" | "中" | "低",
      "type": "task" | "idea",
      "dueDate": "2026-06-20" | null
    }
  ]
}
\`\`\`

- typeは具体的なアクションアイテムなら"task"、将来のアイデアや提案なら"idea"にしてください
- dueDateは会話中に期限や日付が明示されていれば"YYYY-MM-DD"形式で、なければnullにしてください

JSONのみ返してください。説明文は不要です。

---
${transcript}`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\{[\s\S]*\})/)
  if (!jsonMatch) {
    return NextResponse.json({ error: 'Failed to parse AI response', raw: text }, { status: 500 })
  }

  try {
    const parsed = JSON.parse(jsonMatch[1])
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON from AI', raw: text }, { status: 500 })
  }
}
