import { ElMessage } from 'element-plus'
import { Clipboard } from 'ts-clipboard'

export const copyKey = async (text: string, message: string): Promise<void> => {
  await Clipboard.copy(text)
  ElMessage({ message: message, type: 'success' })
}
