import { Switch } from '@element-plus/icons-vue'

export const SwitchColorWithType = (type: string): string => {
  let color: string
  switch (type) {
    case 'edit':
      color = '#E6A23C'
      break
    case 'add':
      color = '#409EFF'
      break
    default:
      color = ''
  }
  return color
}

export const SwitchColorWithRepeat = (isRepeat: boolean, type: string): string => {
  if (isRepeat) return '#F56C6C'
  return SwitchColorWithType(type)
}
