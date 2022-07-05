import { Commit } from 'vuex'
import { configType, getConfig, setConfig } from '@/utils/configStore'
import { handleThemeChange } from '@/utils/theme'

const state: configType = {
  theme: 3,
  isVideoShow: 1,
  language: 3
}

const mutations = {
  initConfig (state: configType, config: configType): void {
    state.theme = config.theme
    state.isVideoShow = config.isVideoShow
    state.language = config.language
    handleThemeChange(config.theme)
  },
  storeConfig (state: configType): void {
    setConfig(state)
  },
  updateTheme (state: configType, theme: number): void {
    state.theme = theme
  },
  updateVideoShow (state: configType, isVideoShow: number): void {
    state.isVideoShow = isVideoShow
  },
  updateLanguage (state: configType, language: number): void {
    state.language = language
  }
}

const actions = {
  async init ({ commit }: { commit: Commit }): Promise<void> {
    const configData = await getConfig()
    commit('initConfig', configData)
  },
  async updateTheme ({ commit }: { commit: Commit }, theme: number): Promise<void> {
    commit('updateTheme', theme)
    commit('storeConfig')
  },
  async updateVideoShow ({ commit }: { commit: Commit }, isVideoShow: number): Promise<void> {
    commit('updateVideoShow', isVideoShow)
    commit('storeConfig')
  },
  async updateLanguage ({ commit }: { commit: Commit }, theme: number): Promise<void> {
    commit('updateLanguage', theme)
    commit('storeConfig')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
