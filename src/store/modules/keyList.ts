import { Commit } from 'vuex'

export interface keyTabType {
  serverLabel: string
  values: string[]
}

interface stateType {
  keyTabList: keyTabType[]
}

interface paramType {
  serverLabel: string
  key: string
}

const state: stateType = {
  keyTabList: []
}

const mutations = {
  addKeyTab (state: stateType, param: paramType): void {
    const targetKeyTabIndex = state.keyTabList.findIndex(item => item.serverLabel === param.serverLabel)
    if (targetKeyTabIndex !== -1) {
      const checkIndex = state.keyTabList[targetKeyTabIndex].values.findIndex((item: string) => item === param.key)
      if (checkIndex === -1) {
        state.keyTabList[targetKeyTabIndex].values.push(param.key)
      }
    } else {
      const values: string[] = []
      values.push(param.key)
      state.keyTabList.push({
        serverLabel: param.serverLabel,
        values: values
      })
    }
  },
  delKeyTab (state: stateType, param: paramType): void {
    const targetKeyTabIndex = state.keyTabList.findIndex(item => item.serverLabel === param.serverLabel)
    state.keyTabList[targetKeyTabIndex].values = state.keyTabList[targetKeyTabIndex].values.filter(item => item !== param.key)
  }
}

const actions = {
  async add ({ commit }: { commit: Commit }, param: paramType): Promise<void> {
    commit('addKeyTab', param)
  },
  async del ({ commit }: { commit: Commit }, param: paramType): Promise<void> {
    commit('delKeyTab', param)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
