export const FormatCommandField = (field: string): string => {
  field = field.trim()

  if (field.indexOf(' ') >= 0) {
    if (field.indexOf('\'') >= 0) return `"${field}"`
    return `'${field}'`
  }

  return field
}
