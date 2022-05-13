export const handleCommandFormat = async (command: string): Promise<string[]> => {
  const arr: string[] = command.split(' ')
  const newArr: string[] = []
  let tmpStr = ''
  let lock = false
  let sign = ''
  arr.forEach((item: string) => {
    if (item.startsWith('\'') && item.endsWith('\'') && !lock && !sign.length) {
      newArr.push(item.replace(/(^'|'$)/g, ''))
    } else if (item.startsWith('"') && item.endsWith('"') && !lock && !sign.length) {
      newArr.push(item.replace(/(^"|"$)/g, ''))
    } else if (item.startsWith('\'') && !sign.length) {
      lock = true
      sign = '\''
      tmpStr += `${item} `
    } else if (item.startsWith('"') && !sign.length) {
      lock = true
      sign = '"'
      tmpStr += `${item} `
    } else if (item.endsWith(sign)) {
      lock = false
      tmpStr += `${item} `
      if (sign === '"') {
        newArr.push(tmpStr.trim().replace(/(^"|"$)/g, ''))
      } else {
        newArr.push(tmpStr.trim().replace(/(^'|'$)/g, ''))
      }
      sign = ''
      tmpStr = ''
    } else if (lock) {
      tmpStr += `${item} `
    } else {
      newArr.push(item)
    }
  })
  return newArr
}
