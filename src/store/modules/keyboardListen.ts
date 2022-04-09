import { Commit } from 'vuex'

interface stateType {
  isCtrl: boolean
}

const state: stateType = {
  isCtrl: false
}

const mutations = {
  setIsCtrl (state: stateType, isCtrl: boolean): void {
    state.isCtrl = isCtrl
  }
}

const actions = {
  async setIsCtrl ({ commit }: { commit: Commit }, isCtrl: boolean): Promise<void> {
    commit('setIsCtrl', isCtrl)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
