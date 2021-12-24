export const SwitchColorWithType = (type: string): string => {
  let color = ''
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
