<template>
  <div id="serverMenu">
    <div class="menu-list">
      <div v-for="(item, index) in state.serverList" :key="index">
        <div class="menu-list-item flex flex-row items-center rounded p-1 cursor-default" @click="clickServer(item, index)">
          <img src="@/assets/right.png"
               alt="icon"
               width="12"
               height="12"
               :class="{'icon': state.currentServerName === item.name}"/>
          <div class="ml-2">{{ item.name }}</div>
        </div>

        <div class="menu-content flex flex-col ml-6" v-show="state.currentServerName === item.name">
          <div class="menu-content-item p-1 rounded cursor-default"
               v-for="(childItem, childIndex) in item.children"
               :key="childIndex"
               @click="handleChildItemClick(item, childItem)"
          >
            {{ childItem }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from 'vuex'
import { onMounted, reactive } from 'vue'
import { getClient } from '@/utils/redis'
import { serverType } from '@/utils/store'

const store = useStore()
const state: {serverList: serverType[], currentServerName: string} = reactive({
  serverList: [],
  currentServerName: ''
})
const clickServer = (server: serverType, index: number) => {
  if (state.currentServerName === server.name) {
    state.currentServerName = ''
  } else {
    state.currentServerName = server.name
    splitServerType(server, index)
    store.commit('serverList/setServerList', server)
  }
}
const splitServerType = async (server: serverType, serverListIndex: number) => {
  const client = getClient(server)
  client.on('error', (err: string) => console.log('Redis Client Error', err))
  await client.connect()
  /*
     # Keyspace
     db0:keys=1,expires=0,avg_ttl=0
     db1:keys=1,expires=0,avg_ttl=0
  */
  const keyspaceInfo = await client.sendCommand(['INFO', 'keyspace'])
  const keySpaceArr = keyspaceInfo.split('\r\n')
  const children: string[] = []
  keySpaceArr.forEach((item: string, index: number) => {
    const dbName = item.split(':')[0]
    if (index && dbName) {
      children.push(`${dbName}`)
    }
  })

  state.serverList[serverListIndex].children = children
}
const handleChildItemClick = (server: serverType, db: string): void => {
  store.dispatch('serverList/addTab', { ...server, db: db })
}

onMounted(async () => {
  await store.commit('serverList/initServerList')

  state.serverList = store.getters.serverList
})
</script>

<style scoped>
#serverMenu {
  display: flex;
  flex-direction: column;
  padding: 16px;
  user-select: none;
}

.menu-list-item:hover {
  background-color: rgba(195, 195, 195, 0.55);
}

.menu-content-item:hover {
  background-color: rgba(199, 196, 196, 0.55);
}

.icon {
  transform: rotate(90deg);
  transition: transform 500ms;
}
</style>
