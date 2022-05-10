import useClipboard from 'vue-clipboard3'
import { ElMessage } from 'element-plus'
import store from '../store'

const { toClipboard } = useClipboard()

export const copyKey = async (text: string): Promise<void> => {
  if (store.getters.isCtrl) {
    await toClipboard(text)
    ElMessage({ message: 'Copy successfully', type: 'success' })
  }
}
