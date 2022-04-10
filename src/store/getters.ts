const getters = {
  serverList: (state: any) => state.serverList.serverList,
  serverTabList: (state: any) => state.serverList.serverTabList,
  currentServerTab: (state: any) => state.serverList.currentServerTab,
  keyTabList: (state: any) => state.keyList.keyTabList,
  isCtrl: (state: any) => state.keyboardListen.isCtrl,
  logList: (state: any) => state.log.logList,
  monitorList: (state: any) => state.monitorList
}

export default getters
