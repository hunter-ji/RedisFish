<template>
    <div id="serverMenu">
        <div class="menu-list">
            <div v-for="(item, index) in serverList" :key="index" @click="clickServer(item.name)">
                <div class="menu-list-item flex flex-row items-center rounded p-1 cursor-default">
                    <img src="@/assets/right.png"
                         alt="icon"
                         width="12"
                         height="12"
                         :class="{'icon': currentServerName === item.name}" />
                    <div class="ml-2">{{ item.name }}</div>
                    <div class="menu-content flex flex-col ml-6">
                        <div class="menu-content-item p-1 rounded cursor-default"
                             v-for="(childItem, childIndex) in item.children"
                             :key="childIndex">{{ childItem }}
                        </div>
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

const clickServer = (serverName) => {
  currentServerName.value = serverName
}

onMounted(async () => {
  const store = useStore()

  await store.commit('initServerList')

  serverList.value = store.state.serverList

  console.log(serverList.value)
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
