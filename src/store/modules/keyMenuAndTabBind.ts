import { Commit } from 'vuex'

interface stateType {
  logList: string[]
  monitorList: string[]
}

const state: stateType = {
  logList: [],
  monitorList: []
}

const mutations = {
  logToggle (state: stateType, data: { serverName: string, dbNumber: number }): void {
    const key = `${data.serverName}_${data.dbNumber}`

    if (state.logList.indexOf(key) === -1) {
      state.logList.push(key)
    } else {
      state.logList = state.logList.filter((item: string) => item !== key)
    }
  },
  monitorToggle (state: stateType, data: { serverName: string, dbNumber: number }): void {
    const key = `${data.serverName}_${data.dbNumber}`

    if (state.monitorList.indexOf(key) === -1) {
      state.monitorList.push(key)
    } else {
      state.monitorList = state.monitorList.filter((item: string) => item !== key)
    }
  }
}

const actions = {
  logToggle ({ commit }: { commit: Commit }, data: { serverName: string, dbNumber: number }): void {
    commit('logToggle', data)
  },
  monitorToggle ({ commit }: { commit: Commit }, data: { serverName: string, dbNumber: number }): void {
    commit('monitorToggle', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
