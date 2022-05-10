const getters = {
  serverList: (state: any) => state.serverList.serverList,
  serverTabList: (state: any) => state.serverList.serverTabList,
  currentServerTab: (state: any) => state.serverList.currentServerTab,
  keyTabList: (state: any) => state.keyList.keyTabList,
  isCtrl: (state: any) => state.keyboardListen.isCtrl,
  monitorList: (state: any) => state.keyMenuAndTabBind.monitorList,
  psList: (state: any) => state.keyMenuAndTabBind.psList,
  theme: (state: any) => state.config.theme
}

export default getters
