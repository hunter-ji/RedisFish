const getters = {
  serverList: (state: any) => state.serverList.serverList,
  serverTabList: (state: any) => state.serverList.serverTabList,
  currentServerTab: (state: any) => state.serverList.currentServerTab,
  keyTabList: (state: any) => state.keyList.keyTabList
}

export default getters
