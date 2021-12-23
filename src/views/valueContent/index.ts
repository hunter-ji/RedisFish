export interface keyMenuType {
  label: string
  value: number
}

export interface hashTableValueType {
  id: number
  field: string
  value: string
  isEdit: boolean
}

export interface listTableValueType {
  id: number
  value: string
  isEdit: boolean
}

export interface setTableValueType {
  id: number
  value: string
  isEdit: boolean
}

export interface zsetTableValueType {
  id: number
  field: string
  score: number
  isEdit: boolean
}
