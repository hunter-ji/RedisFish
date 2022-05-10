<template>
  <div id="serverMenu">
    <div class="h-full flex flex-col justify-between">
      <div>
        <!-- menu header -->
        <div class="flex flex-row items-center justify-between mb-2">
          <div class="font-bold">{{ t('serverMenu.index.title') }}</div>
          <el-tooltip effect="light" :content="t('serverMenu.index.addServerBtn')" placement="bottom" :show-after="1000">
            <plus class="w-5 h-5 p-1 rounded cursor-pointer hover:text-white hover:bg-gray-300" @click="dialogState.addFormDialog = true" />
          </el-tooltip>
        </div>

        <!-- menu list -->
        <div class="menu-list" v-if="state.serverList.length">
          <div v-for="(item, index) in state.serverList" :key="index">
            <div class="menu-list-item flex flex-row items-center rounded p-1 cursor-default" @click="clickServer(item, index)">

              <!-- server menu server name -->
              <div class="flex flex-row items-center justify-between w-full">
                <!-- label click toggle -->
                <div class="flex flex-row items-center">
                  <el-icon :class="{'icon-trans': state.currentServerName === item.name}"><arrow-right-bold /></el-icon>
                  <div class="ml-2">{{ item.name }}</div>
                </div>
                <!-- server config btn -->
                <setting class="w-4 h-4 cursor-pointer hover:text-white opacity-70" @click.stop="openEditFormDialog(item)" />
              </div>
            </div>
            <!-- server menu server name end -->

            <!-- server db list -->
            <div class="menu-content flex flex-col ml-6" v-show="state.currentServerName === item.name">
              <div class="menu-content-item p-1 rounded cursor-default"
                   v-for="(childItem, childIndex) in item.children"
                   :key="childIndex"
                   @click="handleChildItemClick(item, childItem)"
              >
                {{ childItem }}
              </div>
            </div>
            <!-- server db list end -->

          </div>
        </div>
        <div v-else class="flex flex-col justify-center">
          <div  class="text-center mt-6" style="color: #909399;">
            {{ t('serverMenu.index.empty') }}
          </div>
        </div>
      </div>

      <!-- config -->
      <app-config />
    </div>

    <!-- addFormDialog -->
    <el-dialog :title="t('serverMenu.index.addBtn')" v-model="dialogState.addFormDialog">
      <add-form :server-list="state.serverList" @cancel="handleAddFormDialogEvent" @submit="handleAddFormDialogEvent" />
    </el-dialog>
    <!-- addFormDialog end -->

    <!-- editFormDialog -->
    <el-dialog :title="t('serverMenu.index.editBtn')" v-model="dialogState.editFormDialog">
      <edit-form :form="dialogState.currentServerForm" :server-list="state.serverList" @delete="handleEditFormDialogEventDel" @cancel="handleEditFormDialogEventCancel" @submit="handleEditFormDialogEventSubmit" v-if="dialogState.editFormDialog" />
    </el-dialog>
    <!-- editFormDialog end -->
  </div>
</template>

<script setup lang="ts">
import { useStore } from 'vuex'
import { onMounted, reactive } from 'vue'
import { getClient } from '@/utils/redis'
import { serverType, initStoreFile, getStore } from '@/utils/store'
import { Setting, Plus, ArrowRightBold } from '@element-plus/icons-vue'
import AddForm from './addForm.vue'
import EditForm from './editForm.vue'
import { useI18n } from 'vue-i18n'
import AppConfig from '@/views/config/index.vue'

const { t } = useI18n()

const store = useStore()
const state: { serverList: serverType[], currentServerName: string, search: string } = reactive({
  serverList: [],
  currentServerName: '',
  search: ''
})
const dialogState: { addFormDialog: boolean, editFormDialog: boolean, currentServerForm: serverType } = reactive({
  addFormDialog: false,
  editFormDialog: false,
  currentServerForm: {
    id: 0,
    name: '',
    user: '',
    host: '',
    port: 6379,
    password: '',
    tls: {
      tlsCertFilePath: '',
      tlsKeyFilePath: '',
      tlsCaCertFilePath: '',
      tlsCertFile: '',
      tlsKeyFile: '',
      tlsCaCertFile: ''
    }
  }
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
  store.dispatch('serverList/addTab', {
    ...server,
    db: db
  })
}
const fetchData = async () => {
  await initStoreFile()
  const serverList = await getStore()
  await store.dispatch('serverList/updateServer', serverList)
  state.serverList = serverList
}
const addServer = async (server: serverType) => {
  state.serverList.push(server)
}
const handleAddFormDialogEvent = async (data: { server: serverType, eventName: string }) => {
  dialogState.addFormDialog = false
  if (data.eventName === 'submit') {
    // 合并serverList
    await addServer(data.server)

    // 推送store
    await store.dispatch('serverList/updateServer', state.serverList)
    await store.dispatch('serverList/setServer')
  }
}
const openEditFormDialog = (form: serverType) => {
  dialogState.currentServerForm = form
  dialogState.editFormDialog = true
}
const handleEditFormDialogEventCancel = () => {
  dialogState.editFormDialog = false
}
const delServer = async (serverID: number) => {
  state.serverList = state.serverList.filter((item: serverType) => item.id !== serverID)
}
const handleEditFormDialogEventDel = async (serverID: number) => {
  await delServer(serverID)
  await store.dispatch('serverList/updateServer', state.serverList)
  await store.dispatch('serverList/setServer')
  dialogState.editFormDialog = false
}
const updateServer = async (server: serverType, originName: string) => {
  const serverListIndex = state.serverList.findIndex((item: serverType) => item.name === originName)
  state.serverList[serverListIndex] = server
}
const handleEditFormDialogEventSubmit = async (data: { server: serverType, originName: string, eventName: string }) => {
  await updateServer(data.server, data.originName)
  if (data.eventName === 'submit') {
    await store.dispatch('serverList/updateServer', state.serverList)
    await store.dispatch('serverList/setServer')
    dialogState.editFormDialog = false
  }
}

onMounted(async () => {
  await fetchData()
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
  background-color: rgba(195, 195, 195, 0.54);
}

.menu-content-item:hover {
  background-color: rgba(199, 196, 196, 0.55);
}

.icon-trans {
  transform: rotate(90deg);
  transition: transform 500ms;
}
</style>
