export const contentLimit = (content: string): string => {
  return content && content.length > 200 ? content.substring(0, 200) + '...' : content
}
