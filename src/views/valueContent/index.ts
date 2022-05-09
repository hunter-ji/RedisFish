export interface keyMenuType {
  label: string
  value: number
  type: string
}

export interface commandObjectType {
  command: string[]
  result?: string
}

export interface hashTableValueType {
  id: number
  field: string
  oldField: string
  value: string
  oldValue: string
  type: string
  isRepeat: boolean
}

export interface listTableValueType {
  id: number
  value: string
  oldValue: string
  type: string
  isFront: boolean
}

export interface setTableValueType {
  id: number
  value: string
  oldValue: string
  type: string
  isRepeat: boolean
}

export interface zsetTableValueType {
  id: number
  field: string
  oldField: string
  value: string
  oldValue: string
  type: string
  isRepeat: boolean
}

export const stringTypeSelectOptions: { label: string, value: string }[] = [
  {
    label: 'text',
    value: 'text'
  },
  {
    label: 'json',
    value: 'json'
  }
]
