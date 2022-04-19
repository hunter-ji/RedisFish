export interface subMessageType {
  isSend: boolean // 是否用户发发送的数据
  message: string
  time: string
}

export interface subItemType {
  label: string
  isSub: boolean
  messages: subMessageType[]
}
