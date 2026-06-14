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
        <header className="bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-md">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎸🎯</span>
              <div>
                <h1 className="text-xl font-bold tracking-wide">ボン恵一PM</h1>
                <p className="text-orange-100 text-sm">ふたりの共同タスク管理</p>
              </div>
            </div>
            <nav className="flex gap-4">
              <a href="/" className="text-white hover:text-orange-200 font-medium text-sm transition-colors">
                📋 タスク一覧
              </a>
              <a href="/meeting" className="text-white hover:text-orange-200 font-medium text-sm transition-colors">
                📅 月曜ミーティング
              </a>
            </nav>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-6">
          {children}
        </main>
        <footer className="text-center text-gray-400 text-xs py-4 mt-8">
          🎸 ボンちゃん & 杉浦さん 🎯
        </footer>
      </body>
    </html>
  )
}
