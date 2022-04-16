export const dateFormat = (): string => {
  let ret
  let fmt = 'YYYY-mm-dd HH:MM'
  const date = new Date()
  const opt: {'Y+': string, 'm+': string, 'd+': string, 'H+': string, 'M+': string, 'S+': string} = {
    'Y+': date.getFullYear().toString(),
    'm+': (date.getMonth() + 1).toString(),
    'd+': date.getDate().toString(),
    'H+': date.getHours().toString(),
    'M+': date.getMinutes().toString(),
    'S+': date.getSeconds().toString()
  }
  for (const k in opt) {
    ret = new RegExp('(' + k + ')').exec(fmt)
    if (ret) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      fmt = fmt.replace(ret[1], (ret[1].length === 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, '0')))
    }
  }
  return fmt
}

export const timeFormat = (): string => {
  let ret
  let fmt = 'HH:MM:SS'
  const date = new Date()
  const opt: {'H+': string, 'M+': string, 'S+': string} = {
    'H+': date.getHours().toString(),
    'M+': date.getMinutes().toString(),
    'S+': date.getSeconds().toString()
  }
  for (const k in opt) {
    ret = new RegExp('(' + k + ')').exec(fmt)
    if (ret) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      fmt = fmt.replace(ret[1], (ret[1].length === 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, '0')))
    }
  }
  return fmt
}
