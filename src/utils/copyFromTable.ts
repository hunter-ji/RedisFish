import { ElMessage } from 'element-plus'
import store from '../store'
import { Clipboard } from 'ts-clipboard'

export const copyKey = async (text: string, message: string): Promise<void> => {
  if (store.getters.isCtrl) {
    await Clipboard.copy(text)
    ElMessage({ message: message, type: 'success' })
  }
}
