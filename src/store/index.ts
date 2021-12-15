import { createStore } from 'vuex'
import getters from '@/store/getters'

const modulesFiles = require.context('./modules', true, /\.ts$/)

const modules = modulesFiles.keys().reduce((modules, modulePath) => {
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
  const value = modulesFiles(modulePath)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  modules[moduleName] = value.default
  return modules
}, {})

const store = createStore({
  getters,
  modules
})

export default store
