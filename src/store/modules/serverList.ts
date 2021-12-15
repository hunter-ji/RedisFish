import { getStore, serverType, setStore } from '@/utils/store'

interface stateType {
  serverList: serverType[]
}

const state = {
  serverList: [] // serverType[]
}

const mutations = {
  initServerList (state: stateType): void {
    state.serverList = getStore()
  },
  setServerList (state: stateType): void {
    setStore(state.serverList)
  }
}

const actions = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  initServerList ({ commit }): void {
    commit('initServerList')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
