import { Commit } from 'vuex'
import { configType, getConfig, setConfig, transKeyMenuFilterSymbol } from '@/utils/configStore'
import { handleThemeChange } from '@/utils/theme'

const state: configType = {
  theme: 3,
  isVideoShow: 1,
  language: 3,
  keyMenuStatus: 2,
  keyMenuFilterSymbol: 1,
  keyMenuFilterSymbolStr: ':'
}

const mutations = {
  initConfig (state: configType, config: configType): void {
    state.theme = config.theme
    state.isVideoShow = config.isVideoShow
    state.language = config.language
    state.keyMenuStatus = config.keyMenuStatus
    state.keyMenuFilterSymbol = config.keyMenuFilterSymbol
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
  },
  updateKeyMenuStatus (state: configType, keyMenuStatus: number): void {
    state.keyMenuStatus = keyMenuStatus
  },
  updateKeyMenuFilterSymbol (state: configType, keyMenuFilterSymbol: number): void {
    state.keyMenuFilterSymbol = keyMenuFilterSymbol
    state.keyMenuFilterSymbolStr = transKeyMenuFilterSymbol(keyMenuFilterSymbol)
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
  },
  async updateKeyMenuStatus ({ commit }: { commit: Commit }, keyMenuStatus: number): Promise<void> {
    commit('updateKeyMenuStatus', keyMenuStatus)
    commit('storeConfig')
  },
  async updateKeyMenuFilterSymbol ({ commit }: { commit: Commit }, keyMenuFilterSymbol: number): Promise<void> {
    commit('updateKeyMenuFilterSymbol', keyMenuFilterSymbol)
    commit('storeConfig')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
