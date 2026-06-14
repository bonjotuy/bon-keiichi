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
        content: `あなたはプロジェクト管理アシスタントです。以下はミーティングの文字起こしです。

人物情報:
- 山中雄斗（やまなか ゆうと）= ボンちゃん
- 杉浦恵一（すぎうら けいいち）= 杉浦さん

文字起こしからタスクやアイデアを抽出して、JSONのみ返してください。説明文は不要です。

ルール:
- assigneeは「ボンちゃん」か「杉浦さん」のどちらか（上記の人物情報を参照）
- priorityは「高」「中」「低」のどれか
- typeは具体的なアクションなら「task」、将来のアイデアや提案なら「idea」
- dueDateは期限が明示されていれば「YYYY-MM-DD」形式、なければnull

出力形式:
{"tasks":[{"title":"...","description":"...","assignee":"ボンちゃん","project":"...","priority":"中","type":"task","dueDate":null}]}

---
${transcript}`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  // Try to extract JSON from various formats
  const patterns = [
    /```json\s*([\s\S]*?)\s*```/,
    /```\s*(\{[\s\S]*?\})\s*```/,
    /(\{[\s\S]*"tasks"[\s\S]*\})/,
    /(\{[\s\S]*\})/,
  ]

  let jsonStr: string | null = null
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) { jsonStr = match[1].trim(); break }
  }

  // タスクなしとして返す（エラーにしない）
  if (!jsonStr) {
    return NextResponse.json({ tasks: [] })
  }

  try {
    const parsed = JSON.parse(jsonStr)
    return NextResponse.json({ tasks: parsed.tasks || [] })
  } catch {
    // 最終手段: tasks配列を直接探す
    const arrayMatch = text.match(/\[\s*\{[\s\S]*?\}\s*\]/)
    if (arrayMatch) {
      try {
        const tasks = JSON.parse(arrayMatch[0])
        return NextResponse.json({ tasks })
      } catch { /* fall through */ }
    }
    return NextResponse.json({ tasks: [] })
  }
}
