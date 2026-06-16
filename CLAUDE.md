# ボン恵一PM - プロジェクト概要

## アプリ概要
ぼんちゃん（山中雄斗）と恵一（杉浦恵一）の2人用タスク管理アプリ。

## 技術スタック
- Next.js (App Router)
- Supabase（データベース）
- Vercel（ホスティング）
- Tailwind CSS

## デプロイ
- Vercel にデプロイ済み
- GitHubのブランチ `claude/sleepy-mendel-af2n2m` がVercleの本番環境と連携
- 変更はPRを作って `claude/sleepy-mendel-af2n2m` にマージするとVercelが自動デプロイ

## Supabase
- `tasks` テーブルでタスク管理
- カラム: `id, type, title, description, assignee, project, priority, status, created_at, updated_at, due_date, deleted`
- `deleted` カラム（boolean）: ゴミ箱機能用（2026/06/16追加）
- 環境変数: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`

## 担当者名
- ぼんちゃん（旧: ボンちゃん）
- 恵一（旧: 杉浦さん）

## UI構成
- 上部: 人物フィルターボタン（ぼんちゃん / 恵一 / 全員）＋未完了タスク数
- ステータスフィルター: 未完了 / 進行中 / 完了済み / ゴミ箱 / すべて
- タスクカード: ステータス切替ボタン（未完了/進行中/完了）内蔵
- ゴミ箱: ソフトデリート、元に戻す・完全削除が可能

## 取り込み機能
- Google Meetの文字起こしからAIがタスクを自動抽出
- `ANTHROPIC_API_KEY` が必要（Vercelの環境変数に設定済み）
- 取り込み時に担当者・プロジェクト・優先度・期限を変更可能

## プロジェクト一覧
- 藤田鉄工所
- スロハ青森
- スロハ波方
- スロハ和束
- 週刊スローハウス
- その他
