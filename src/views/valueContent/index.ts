export interface keyMenuType {
  label: string
  value: number
}

export interface commandObjectType {
  command: string[]
}

export interface hashTableValueType {
  id: number
  field: string
  oldField: string
  value: string
  oldValue: string
  type: string,
  isRepeat: boolean
}

export interface listTableValueType {
  id: number
  value: string
  oldValue: string
  type: string,
  isFront: boolean
}

export interface setTableValueType {
  id: number
  value: string
  oldValue: string
  type: string,
  isRepeat: boolean
}

export interface zsetTableValueType {
  id: number
  field: string
  oldField: string
  value: string
  oldValue: string
  type: string,
  isRepeat: boolean
}