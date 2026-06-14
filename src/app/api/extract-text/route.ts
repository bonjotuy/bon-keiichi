import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'ファイルが必要です' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfModule = await import('pdf-parse') as any
      const pdfParse = pdfModule.default ?? pdfModule
      const data = await pdfParse(buffer)
      return NextResponse.json({ text: data.text })
    } catch {
      return NextResponse.json({ error: 'PDFの読み込みに失敗しました' }, { status: 500 })
    }
  }

  // text file
  const text = new TextDecoder('utf-8').decode(buffer)
  return NextResponse.json({ text })
}
