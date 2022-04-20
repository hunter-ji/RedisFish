export const checkIsJSON = (str: string): boolean => {
  try {
    const obj = JSON.parse(str)
    return !!(typeof obj === 'object' && obj)
  } catch (e) {
    return false
  }
}
