<template>
  <div class="key-menu-container flex flex-row justify-between">
    <!--key-menu-->
    <div class="flex flex-col just items-center">
      <div class="key-menu-tool w-full p-2 flex flex-row is-text justify-between">
        <!--search-->
        <div
          :class="searchState.search.length ? 'w-3/4 transition-width duration-1000 ease-in-out delay-200' : 'w-2/4 transition-width duration-1000 ease-in-out'">
          <el-input v-model="searchState.search" size="small" :placeholder="t('keyMenu.searchInputPlaceholder')" clearable :prefix-icon="Search" @keyup.enter="search"/>
        </div>

        <!--btn group-->
        <div class="flex flex-row items-center justify-end w-1/4">
          <transition name="slide-fade">
            <div class="flex flex-row items-center justify-end" v-if="!searchState.search.length" style="margin-right: 10px;">
              <el-tooltip effect="light" :content="t('keyMenu.btnGroup.log')" placement="bottom" :show-after="1000">
                <el-button type="primary" size="mini" :icon="Tickets" circle @click="fetchData"/>
              </el-tooltip>
            </div>
          </transition>
          <transition name="slide-fade">
            <div class="flex flex-row items-center justify-end" v-if="!searchState.search.length" style="margin-right: 10px;">
              <el-tooltip effect="light" :content="t('keyMenu.btnGroup.refresh')" placement="bottom" :show-after="1000">
                <el-button type="info" size="mini" :icon="RefreshRight" circle @click="fetchData"/>
              </el-tooltip>
            </div>
          </transition>
          <el-tooltip effect="light" :content="t('keyMenu.btnGroup.delete')" placement="bottom" :show-after="1000">
            <el-button type="danger" size="mini" disabled :icon="Delete" circle v-if="!state.multipleSelection.length"/>
            <el-button type="danger" size="mini" :icon="Delete" round class="flex flex-row items-center" @click="delKey" v-else>
              ({{ state.multipleSelection.length }})
            </el-button>
          </el-tooltip>
        </div>
      </div>

      <!--keys tale-->
      <el-table :data="searchState.isSearching ? searchState.keysList : state.keysList" size="mini" height="95%" style="width: 100%;" stripe @cell-click="copyKey" @cell-dblclick="getValue"
                @selection-change="handleSelectionChange" class="pb-4" v-loading="state.loading">
        <el-table-column type="selection" width="50"/>
        <el-table-column prop="label" label="Keys" width="350"/>
      </el-table>

      <!--pagination-->
      <el-pagination layout="prev, pager, next" :total="pageState.total" :page-size="pageState.pageSize"
                     v-model:current-page="pageState.currentPage" @current-change="fetchData()" :hide-on-single-page="true"
                     class="py-2" v-show="!searchState.isSearching"
      />
      <el-pagination layout="prev, pager, next" :total="pageState.total" :page-size="pageState.pageSize"
                     v-model:current-page="searchPageState.currentPage" @current-change="search()" :hide-on-single-page="true"
                     class="py-2" v-show="searchState.isSearching"
      />

    </div>

    <!--key-tab-->
    <key-tab class="key-tab h-full w-full" :server-tab="props.serverTab" :target-key="state.targetKey" @addKeyTab="addTab"/>

    <!--del key dialog-->
    <el-dialog v-model="dialogState.show" :title="t('keyMenu.delDialog.title')" width="30%" center>
      <span>{{ t('keyMenu.delDialog.content') }}</span>
      <template #footer>
        <span class="flex flex-row items-center justify-center">
          <el-button @click="dialogState.show = false" class="mr-2">{{ t('keyMenu.delDialog.cancel') }}</el-button>
          <el-button type="primary" @click="delKeyDialogSubmit()">{{ t('keyMenu.delDialog.submit') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, PropType, reactive, watch } from 'vue'
import { serverTabType } from '@/store/modules/serverList'
import { getClient } from '@/utils/redis'
import { useStore } from 'vuex'
import { Delete, RefreshRight, Search, Tickets } from '@element-plus/icons-vue'
import KeyTab from '@/views/keyTab/index.vue'
import { keyMenuType } from '@/views/valueContent/index'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import useClipboard from 'vue-clipboard3'

const { t } = useI18n()
const { toClipboard } = useClipboard()

const props = defineProps({
  serverTab: {
    type: Object as PropType<serverTabType>,
    required: true
  }
})

const store = useStore()
const client = getClient(props.serverTab)
const state: { keysList: keyMenuType[], targetKey: string, multipleSelection: string[], loading: boolean } = reactive({
  keysList: [],
  targetKey: '',
  multipleSelection: [],
  loading: true
})
const searchState: { keysList: keyMenuType[], search: string, isSearching: boolean } = reactive({
  keysList: [],
  search: '',
  isSearching: false
})
const dialogState: { show: boolean } = reactive({
  show: false
})
const pageState: { scanIndex: string, total: number, pageSize: number, currentPage: number } = reactive({
  scanIndex: '0',
  total: 0,
  pageSize: 50,
  currentPage: 1
})
const searchPageState: { scanIndex: string, total: number, pageSize: number, currentPage: number, lock: boolean } = reactive({
  scanIndex: '0',
  total: 0,
  pageSize: 50,
  currentPage: 1,
  lock: false
})
const changeLoading = async (status: boolean) => {
  state.loading = status
}
const getKeysLength = async (keyspaceInfo: string, dbIndex: string): Promise<number> => {
  const keySpaceArr = keyspaceInfo.split('\r\n')
  // targetIndexDB db0:keys=1,expires=0,avg_ttl=0
  const targetIndexDB = keySpaceArr[Number(dbIndex) + 1]
  return Number(targetIndexDB.split(':')[1].split(',')[0].split('=')[1])
}
const fetchData = async () => {
  const dbIndex = props.serverTab.db.slice(-1)
  await changeLoading(true)
  state.keysList = []
  await client.connect()
  await client.sendCommand(['select', dbIndex])

  const keyspaceInfo: string = await client.sendCommand(['INFO', 'keyspace'])
  pageState.total = await getKeysLength(keyspaceInfo, dbIndex)

  const scanResult: [string, string[]] = await client.sendCommand(['SCAN', pageState.scanIndex, 'COUNT', String(pageState.pageSize)])
  pageState.scanIndex = scanResult[0]
  const keys = scanResult[1]

  keys.forEach((item: string, index: number) => {
    state.keysList.push({
      label: item,
      value: index
    })
  })
  await client.disconnect()
  await changeLoading(false)
}
const copyKey = async (e: { label: string, value: number }) => {
  if (store.getters.isCtrl) {
    await toClipboard(e.label)
    ElMessage({
      message: '复制成功',
      type: 'success'
    })
  }
}
const getValue = async (e: { label: string, value: number }) => {
  const { label } = e

  await addTab(label)
}
const addTab = async (targetName: string) => {
  await store.dispatch('keyList/add', {
    serverLabel: `${props.serverTab.db} ${props.serverTab.name}`,
    key: targetName
  })
  state.targetKey = targetName
}
const handleSelectionChange = (val: string[]) => {
  state.multipleSelection = val
}
const search = async () => {
  searchState.isSearching = true
  searchState.keysList = []
  if (!searchPageState.lock) {
    searchPageState.currentPage = 1
    searchPageState.scanIndex = '0'
    searchPageState.lock = true
  }
  await client.connect()
  await client.sendCommand(['select', props.serverTab.db.slice(-1)])

  const scanResult: [string, string[]] = await client.sendCommand(['SCAN', searchPageState.scanIndex, 'MATCH', `*${searchState.search}*`, 'COUNT', String(searchPageState.pageSize)])
  searchPageState.scanIndex = scanResult[0]
  const keys = scanResult[1]

  keys.forEach((item: string, index: number) => {
    searchState.keysList.push({
      label: item,
      value: index
    })
  })
  await client.disconnect()
}
const delKey = () => {
  dialogState.show = true
}
const delKeyDialogCancel = async () => {
  dialogState.show = false
}
const delKeyDialogSubmit = async () => {
  await client.connect()
  await client.sendCommand(['select', props.serverTab.db.slice(-1)])
  for (const item of state.multipleSelection) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await client.sendCommand(['del', item.label])
    await store.dispatch('keyList/del', {
      serverLabel: `${props.serverTab.db} ${props.serverTab.name}`,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      key: item.label
    })
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (item.label === state.targetKey) state.targetKey = 'Console'
  }
  await client.disconnect()
  await fetchData()
  await delKeyDialogCancel()
}

onMounted(async () => {
  await fetchData()
})

watch(searchState, () => {
  if (!searchState.search.length) {
    searchState.isSearching = false
    searchState.keysList = []
    if (searchPageState.lock) {
      searchPageState.lock = false
    }
  }
})
</script>

<style>
.key-menu-container {
  height: calc(100vh - 60px);
  width: 100%;
  overflow-y: hidden;
}

.key-menu {
  width: 400px;
  min-width: 400px;
  height: calc(100vh - 130px);
}

.slide-fade-enter-active {
  transition: all 500ms ease-in;
}

.slide-fade-leave-active {
  transition: all 200ms ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
