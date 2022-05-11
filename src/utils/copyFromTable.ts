import { ElMessage } from 'element-plus'
import store from '../store'
import { Clipboard } from 'ts-clipboard'

export const copyKey = async (text: string): Promise<void> => {
  if (store.getters.isCtrl) {
    await Clipboard.copy(text)
    ElMessage({ message: 'Copy successfully', type: 'success' })
  }
}
