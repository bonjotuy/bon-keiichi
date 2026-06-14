export type Assignee = 'ボンちゃん' | '杉浦さん'
export type Priority = '高' | '中' | '低'
export type Status = '未着手' | '進行中' | '完了'
export type ItemType = 'task' | 'idea'

export interface Task {
  id: string
  type: ItemType
  title: string
  description: string
  assignee: Assignee
  project: string
  priority: Priority
  status: Status
  createdAt: string
  updatedAt?: string
  dueDate?: string
}

export interface TasksData {
  tasks: Task[]
}
