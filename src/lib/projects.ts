export const PROJECTS = [
  '藤田鉄工所',
  'スロハ青森',
  'スロハ波方',
  'スロハ和束',
  '週刊スローハウス',
  'その他',
] as const

export type ProjectName = typeof PROJECTS[number]
