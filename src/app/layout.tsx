import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ボン恵一PM',
  description: 'ボンちゃんと杉浦さんの共同タスク管理',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="bg-warm-50 min-h-screen">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <span className="text-xl">🎸🎯</span>
              <span className="font-bold text-gray-800 tracking-tight">ボン恵一PM</span>
            </a>
            <nav className="flex gap-1 items-center">
              <a href="/" className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors font-medium">
                タスク
              </a>
              <a href="/import" className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors font-medium">
                取り込み
              </a>
              <a href="/?new=1" className="ml-1 px-3 py-1.5 rounded-lg text-sm bg-orange-500 text-white hover:bg-orange-600 transition-colors font-medium">
                新規タスク＋
              </a>
            </nav>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}
