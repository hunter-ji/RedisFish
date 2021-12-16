import { getStore, serverType, setStore } from '@/utils/store'
import { Commit } from 'vuex'

export interface serverTabType extends serverType {
  db: string
}

interface stateType {
  serverList: serverType[]
  serverTabList: serverTabType[]
  currentServerTab: string
}

const state = {
  serverList: [],
  serverTabList: [],
  currentServerTab: ''
}

const mutations = {
  initServerList (state: stateType): void {
    state.serverList = getStore()
  },
  setServerList (state: stateType): void {
    setStore(state.serverList)
  },
  setServerTabList (state: stateType, serverTab: serverTabType): void {
    if (state.serverTabList.findIndex((item: serverTabType) => `${item.db} ${item.name}` === `${serverTab.db} ${serverTab.name}`) === -1) {
      state.serverTabList.push(serverTab)
    }
  },
  delServerTabList (state: stateType, targetName: string): void {
    state.serverTabList = state.serverTabList.filter((item: serverTabType) => `${item.db} ${item.name}` !== targetName)
  },
  setCurrentServerTab (state: stateType, serverTab: string): void {
    state.currentServerTab = serverTab
  }
}

const actions = {
  addTab ({ commit }: { commit: Commit }, serverTab: serverTabType) {
    commit('setCurrentServerTab', `${serverTab.db} ${serverTab.name}`)
    commit('setServerTabList', serverTab)
  },
  delTab ({ commit }: { commit: Commit }, targetName: string) {
    commit('delServerTabList', targetName)

    if (state.serverTabList.length && targetName === state.currentServerTab) {
      const lastServerTab: serverTabType = state.serverTabList[state.serverTabList.length - 1]
      commit('setCurrentServerTab', `${lastServerTab.db} ${lastServerTab.name}`)
    } else if (!state.serverTabList.length) {
      commit('setCurrentServerTab', '')
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
