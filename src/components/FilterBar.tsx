'use client'

import { Assignee } from '@/types/task'

interface FilterBarProps {
  selectedAssignee: Assignee | '全員'
  selectedProject: string
  projects: string[]
  onAssigneeChange: (assignee: Assignee | '全員') => void
  onProjectChange: (project: string) => void
}

const assignees: (Assignee | '全員')[] = ['全員', 'ボンちゃん', '杉浦さん']

export default function FilterBar({
  selectedAssignee,
  selectedProject,
  projects,
  onAssigneeChange,
  onProjectChange,
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-3 items-center">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600">担当者:</span>
        <div className="flex gap-1 flex-wrap">
          {assignees.map((assignee) => (
            <button
              key={assignee}
              onClick={() => onAssigneeChange(assignee)}
              className={`text-sm px-3 py-1 rounded-full transition-colors ${
                selectedAssignee === assignee
                  ? 'bg-orange-400 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {assignee}
            </button>
          ))}
        </div>
      </div>
      {projects.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">プロジェクト:</span>
          <select
            value={selectedProject}
            onChange={(e) => onProjectChange(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            <option value="">すべて</option>
            {projects.map((project) => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
