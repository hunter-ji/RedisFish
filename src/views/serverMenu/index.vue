<template>
    <div id="serverMenu">
        <div class="menu-list">
            <div v-for="(item, index) in serverList" :key="index" @click="clickServer(item, index)">
                <div class="menu-list-item flex flex-row items-center rounded p-1 cursor-default">
                    <img src="@/assets/right.png"
                         alt="icon"
                         width="12"
                         height="12"
                         :class="{'icon': currentServerName === item.name}" />
                    <div class="ml-2">{{ item.name }}</div>
                </div>

                <div class="menu-content flex flex-col ml-6" v-show="currentServerName === item.name">
                    <div class="menu-content-item p-1 rounded cursor-default"
                         v-for="(childItem, childIndex) in item.children"
                         :key="childIndex">
                        {{ childItem }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useStore } from 'vuex'
import { onMounted, ref } from 'vue'
import { getClient } from '@/utils/redis'
import { getStore } from '@/utils/store'

const serverList = ref([])
const currentServerName = ref('')

const clickServer = (server, index) => {
  if (currentServerName.value === server.name) {
    console.log('收起')
    currentServerName.value = ''
  } else {
    console.log('展开')
    currentServerName.value = server.name
    splitServerType(server, index)
  }
}

const splitServerType = async (server, serverListIndex) => {
  const client = getClient(server)
  client.on('error', (err) => console.log('Redis Client Error', err))

  await client.connect()
  const keyspaceInfo = await client.sendCommand(['INFO', 'keyspace'])
  const keySpaceArr = keyspaceInfo.split('\r\n')
  const children = []
  keySpaceArr.forEach((item, index) => {
    const dbName = item.split(':')[0]
    if (index && dbName) {
      children.push(dbName)
    }
  })

  serverList.value[serverListIndex].children = children

  console.log(serverList.value)

  /*
     # Keyspace
     db0:keys=1,expires=0,avg_ttl=0
     db1:keys=1,expires=0,avg_ttl=0
     */
}

onMounted(async () => {
  const store = useStore()

  await store.commit('initServerList')

  serverList.value = store.state.serverList
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
