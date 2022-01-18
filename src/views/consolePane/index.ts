export interface historyCommandType {
  command: string
  result: string
  resultData: string
  createdAt: string
}

export interface outputPaneType {
  command: string
  result: any
}

export interface outputPaneResultType {
  value: string
}

export interface outputPaneResultDoubleRowType {
  field: string
  value: string
}
