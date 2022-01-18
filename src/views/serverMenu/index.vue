<template>
  <div id="serverMenu">
    <div class="menu-list">
      <div v-for="(item, index) in state.serverList" :key="index">
        <div class="menu-list-item flex flex-row items-center rounded p-1 cursor-default">

          <!-- server menu server name -->
          <div class="flex flex-row items-center justify-between w-full">
            <!-- label 点击展开/关闭 -->
            <div class="flex flex-row items-center" @click="clickServer(item, index)">
              <img src="@/assets/right.png"
                   alt="icon"
                   width="12"
                   height="12"
                   :class="{'icon': state.currentServerName === item.name}"/>
              <div class="ml-2">{{ item.name }}</div>
            </div>
            <!-- server操作按钮 -->
            <setting class="w-5 h-5 cursor-pointer hover:text-blue-400" @click="openEditFormDialog(item)" />
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

    <!-- addFormDialog -->
    <el-dialog title="新增" v-model="dialogState.addFormDialog">
      <add-form />
    </el-dialog>
    <!-- addFormDialog end -->

    <!-- editFormDialog -->
    <el-dialog title="编辑" v-model="dialogState.editFormDialog">
      <edit-form :form="dialogState.currentServerForm" @delete="handleEditFormDialogEvent" @cancel="handleEditFormDialogEvent" @submit="handleEditFormDialogEvent" />
    </el-dialog>
    <!-- editFormDialog end -->
  </div>
</template>

<script setup lang="ts">
import { useStore } from 'vuex'
import { onMounted, reactive } from 'vue'
import { getClient } from '@/utils/redis'
import { serverType } from '@/utils/store'
import { Setting } from '@element-plus/icons-vue'
import AddForm from './addForm.vue'
import EditForm from './editForm.vue'

const store = useStore()
const state: { serverList: serverType[], currentServerName: string } = reactive({
  serverList: [],
  currentServerName: ''
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
    password: ''
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
  await store.commit('serverList/initServerList')

  state.serverList = store.getters.serverList
}
const handleAddFormDialogEvent = (eventName: string) => {
  dialogState.addFormDialog = false
  if (eventName === 'submit') {
    fetchData()
  }
}
const openEditFormDialog = (form: serverType) => {
  dialogState.currentServerForm = form
  dialogState.editFormDialog = true
}
const handleEditFormDialogEvent = (eventName: string) => {
  dialogState.editFormDialog = false
  if (eventName === 'delete' || eventName === 'submit') {
    fetchData()
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

.icon {
  transform: rotate(90deg);
  transition: transform 500ms;
}
</style>
