import { createStore } from 'vuex'
import { serverType, setStore, getStore } from '@/utils/store'

export default createStore({
  state: {
    serverList: []
  },
  mutations: {
    initServerList (state) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      state.serverList = getStore()
    },
    setServerList (state) {
      setStore(state.serverList)
    }
  },
  actions: {
  },
  modules: {
  }
})
