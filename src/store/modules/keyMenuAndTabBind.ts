import { Commit } from 'vuex'
import { serverTabType } from '@/store/modules/serverList'

interface stateType {
  monitorList: string[]
}

const genKey = (serverTab: serverTabType): string => {
  return `${serverTab.name}_${serverTab.db}`
}

const state: stateType = {
  monitorList: []
}

const mutations = {
  monitorToggle (state: stateType, serverTab: serverTabType): void {
    const key = genKey(serverTab)

    if (state.monitorList.indexOf(key) === -1) {
      state.monitorList.push(key)
    } else {
      state.monitorList = state.monitorList.filter((item: string) => item !== key)
    }
  }
}

const actions = {
  monitorToggle ({ commit }: { commit: Commit }, serverTab: serverTabType): void {
    commit('monitorToggle', serverTab)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
