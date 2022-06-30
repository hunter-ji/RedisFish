<template>
  <div class="key-menu-container flex flex-row justify-between">
    <!--key-menu-->
    <div class="flex flex-col just items-center">
      <div class="key-menu-tool w-full p-2 flex flex-row is-text justify-between">
        <!--search-->
        <div
          :class="searchState.search.length ? 'w-3/4 transition-width duration-1000 ease-in-out delay-200' : 'w-2/5 transition-width duration-1000 ease-in-out'">
          <el-input v-model="searchState.search" size="small" :placeholder="t('keyMenu.searchInputPlaceholder')" clearable :prefix-icon="Search" @keyup.enter="search"/>
        </div>

        <!--btn group-->
        <div class="flex flex-row items-center justify-end w-1/4">
          <transition name="slide-fade">
            <div class="flex flex-row items-center justify-end" v-if="!searchState.search.length" style="margin-right: 10px;">
              <el-tooltip effect="light" :content="t('keyMenu.btnGroup.monitor')" placement="bottom" :show-after="1000">
                <el-button type="success" size="small" :icon="DataLine" circle @click="handleMonitorToggle"/>
              </el-tooltip>
            </div>
          </transition>
          <transition name="slide-fade">
            <div class="flex flex-row items-center justify-end" v-if="!searchState.search.length" style="margin-right: 10px;">
              <el-tooltip effect="light" :content="t('keyMenu.btnGroup.log')" placement="bottom" :show-after="1000">
                <el-button type="primary" size="small" :icon="Tickets" circle @click="dialogState.logShow = true"/>
              </el-tooltip>
            </div>
          </transition>
          <transition name="slide-fade">
            <div class="flex flex-row items-center justify-end" v-if="!searchState.search.length" style="margin-right: 10px;">
              <el-tooltip effect="light" :content="t('keyMenu.btnGroup.sub')" placement="bottom" :show-after="1000">
                <el-button type="warning" size="small" :icon="Switch" circle @click="handlePsToggle"/>
              </el-tooltip>
            </div>
          </transition>
          <transition name="slide-fade">
            <div class="flex flex-row items-center justify-end" v-if="!searchState.search.length" style="margin-right: 10px;">
              <el-tooltip effect="light" :content="t('keyMenu.btnGroup.refresh')" placement="bottom" :show-after="1000">
                <el-button type="info" size="small" :icon="RefreshRight" circle @click="fetchData"/>
              </el-tooltip>
            </div>
          </transition>
          <el-tooltip effect="light" :content="t('keyMenu.btnGroup.delete')" placement="bottom" :show-after="1000">
            <el-button type="danger" size="small" disabled :icon="Delete" circle v-if="!state.multipleSelection.length"/>
            <el-button type="danger" size="small" :icon="Delete" round class="flex flex-row items-center" @click="delKey" v-else>
              ({{ state.multipleSelection.length }})
            </el-button>
          </el-tooltip>
        </div>
      </div>

      <!--keys tale-->
      <el-table :data="searchState.isSearching ? searchState.keysList : state.keysList" size="small" height="90%" style="width: 100%;" stripe @cell-dblclick="getValue"
                @selection-change="handleSelectionChange" class="pb-4" v-loading="state.loading">
        <el-table-column type="selection" width="50"/>
        <el-table-column prop="type" label="Type" width="70" :filters="groupState.typeFilterList" :filter-method="handleKeyTypeFilter">
          <template #default="scope">
            <div class="text-green-500 italic mr-2">{{ scope.row.type }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="label" label="Key" width="280" :filters="groupState.list" :filter-method="handleKeyGroupFilter">
          <template #default="scope">
            <div
              @click.left.meta.exact="copyKey(scope.row.label, t('valueContent.notification.copySuccessMessage'))"
              @click.left.ctrl.exact="copyKey(scope.row.label, t('valueContent.notification.copySuccessMessage'))"
            >
              {{ scope.row.label }}
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!--pagination-->
      <el-pagination layout="total, prev, pager, next" :total="pageState.total" :page-size="pageState.pageSize"
                     v-model:current-page="pageState.currentPage" @current-change="handlePageChange()"
                     class="py-2 mt-2" v-show="!searchState.isSearching" small="small" :hide-on-single-page="true"
      />
      <el-pagination layout="prev, pager, next" :total="searchPageState.total" :page-size="searchPageState.pageSize"
                     v-model:current-page="searchPageState.currentPage" @current-change="search()"
                     class="py-2 mt-2" v-show="searchState.isSearching" small="small" :hide-on-single-page="true"
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

    <!-- history log -->
    <el-dialog v-model="dialogState.logShow" :title="t('keyMenu.delDialog.title')" width="60%" center top="10vh">
      <history-log :server-tab="props.serverTab" v-if="dialogState.logShow" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, PropType, reactive, watch } from 'vue'
import { serverTabType } from '@/store/modules/serverList'
import { getClient } from '@/utils/redis'
import { useStore } from 'vuex'
import { Delete, RefreshRight, Search, Tickets, DataLine, Switch } from '@element-plus/icons-vue'
import KeyTab from '@/views/keyTab/index.vue'
import { keyMenuType } from '@/views/valueContent/index'
import { useI18n } from 'vue-i18n'
import HistoryLog from '@/views/historyLog/index.vue'
import { setLog } from '@/utils/log'
import { dateFormat } from '@/utils/formatTime'
import { copyKey } from '@/utils/copyFromTable'

const { t } = useI18n()

const props = defineProps({
  serverTab: {
    type: Object as PropType<serverTabType>,
    required: true
  }
})

const store = useStore()
const client = getClient(props.serverTab)
const state: { keysList: keyMenuType[], targetKey: string, multipleSelection: keyMenuType[], loading: boolean } = reactive({
  keysList: [],
  targetKey: '',
  multipleSelection: [],
  loading: true
})
const groupState: { list: { text: string, value: string }[], typeFilterList: { text: string, value: string }[] } = reactive({
  list: [],
  typeFilterList: []
})
const searchState: { keysList: keyMenuType[], search: string, isSearching: boolean } = reactive({
  keysList: [],
  search: '',
  isSearching: false
})
const dialogState: { show: boolean, logShow: boolean } = reactive({
  show: false,
  logShow: false
})
const pageState: { scanIndexList: {[key: string]: string}, total: number, pageSize: number, currentPage: number } = reactive({
  scanIndexList: { 1: '0' },
  total: 0,
  pageSize: 50,
  currentPage: 1
})
const searchPageState: { scanIndex: string, total: number, pageSize: number, currentPage: number, lock: boolean } = reactive({
  scanIndex: '0',
  total: 0,
  pageSize: 200,
  currentPage: 1,
  lock: false
})
const changeLoading = async (status: boolean) => {
  state.loading = status
}
const handleKeyTypeFilter = (value: string, row: keyMenuType): boolean => {
  return row.type === value
}
const handleKeyGroupFilter = (value: string, row: keyMenuType): boolean => {
  return row.label.startsWith(value)
}
const getKeysLength = async (keyspaceInfo: string, dbIndex: string): Promise<number> => {
  const keySpaceArr = keyspaceInfo.split('\r\n')
  const dbNode = keySpaceArr.filter((item: string) => item.startsWith(`db${Number(dbIndex)}`))
  if (!dbNode.length) {
    return 0
  }
  // targetIndexDB db0:keys=1,expires=0,avg_ttl=0
  const targetIndexDB = dbNode[0]
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

  if (pageState.total) {
    const scanResult: [string, string[]] = await client.sendCommand(['SCAN', pageState.scanIndexList[1], 'COUNT', String(pageState.pageSize)])
    if (!pageState.scanIndexList[2]) {
      pageState.scanIndexList[2] = scanResult[0]
    }
    const keys = scanResult[1]

    const groupList: string[] = []
    const typeFilterList: string[] = []

    for (let index = 0; index < keys.length; index++) {
      const item = keys[index]

      const type = await client.sendCommand(['type', item])
      state.keysList.push({
        label: item,
        value: index,
        type: typeof type === 'string' ? type : 'unknown'
      })

      // push type
      typeFilterList.push(type)

      // push pre string
      const preArr = /[\da-zA-Z]+(?=[:\-_#=+])/.exec(item)
      if (preArr && Object.keys(preArr).length >= 2) {
        groupList.push(preArr[0])
      }
    }

    const groupListSingle = [...new Set(groupList)]
    groupState.list = groupListSingle.map((item: string) => ({ text: item, value: item }))

    const typeFilterListSingle = [...new Set(typeFilterList)]
    groupState.typeFilterList = typeFilterListSingle.map((item: string) => ({ text: item, value: item }))
  }

  await client.disconnect()
  await changeLoading(false)
}
const handlePageChange = async () => {
  const dbIndex = props.serverTab.db.slice(-1)
  await changeLoading(true)
  state.keysList = []
  await client.connect()
  await client.sendCommand(['select', dbIndex])

  const keyspaceInfo: string = await client.sendCommand(['INFO', 'keyspace'])
  pageState.total = await getKeysLength(keyspaceInfo, dbIndex)

  if (pageState.total) {
    let scanResult = []
    const pages = Object.keys(pageState.scanIndexList).length
    const diffNumber = pageState.currentPage - pages
    if (diffNumber >= 1) {
      // If the user jumps and clicks
      for (let i = 0; i < diffNumber; i++) {
        scanResult = await client.sendCommand(['SCAN', pageState.scanIndexList[pages + i], 'COUNT', String(pageState.pageSize)])
        if (!pageState.scanIndexList[pages + i + 1]) {
          pageState.scanIndexList[pages + i + 1] = scanResult[0]
        }
      }
    } else {
      scanResult = await client.sendCommand(['SCAN', pageState.scanIndexList[pageState.currentPage], 'COUNT', String(pageState.pageSize)])
      if (!pageState.scanIndexList[pageState.currentPage + 1]) {
        pageState.scanIndexList[pageState.currentPage + 1] = scanResult[0]
      }
    }
    const keys = scanResult[1]

    const groupList: string[] = []
    const typeFilterList: string[] = []
    for (let index = 0; index < keys.length; index++) {
      const item = keys[index]

      const type = await client.sendCommand(['type', item])
      state.keysList.push({
        label: item,
        value: index,
        type: typeof type === 'string' ? type : 'unknown'
      })

      // push type
      typeFilterList.push(type)

      // push pre string
      const preArr = /[\da-zA-Z]+(?=[:\-_#=+])/.exec(item)
      if (preArr && Object.keys(preArr).length >= 2) {
        groupList.push(preArr[0])
      }
    }

    const groupListSingle = [...new Set(groupList)]
    groupState.list = groupListSingle.map((item: string) => ({ text: item, value: item }))

    const typeFilterListSingle = [...new Set(typeFilterList)]
    groupState.typeFilterList = typeFilterListSingle.map((item: string) => ({ text: item, value: item }))
  }

  await client.disconnect()
  await changeLoading(false)
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
const handleSelectionChange = (val: keyMenuType[]) => {
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
  // searchPageState.scanIndex = scanResult[0]
  const keys = scanResult[1]

  for (let index = 0; index < keys.length; index++) {
    const item = keys[index]
    const type = await client.sendCommand(['type', item])
    searchState.keysList.push({
      label: item,
      value: index,
      type: typeof type === 'string' ? type : 'unknown'
    })
  }
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
    await client.sendCommand(['del', item.label])
    await store.dispatch('keyList/del', {
      serverLabel: `${props.serverTab.db} ${props.serverTab.name}`,
      key: item.label
    })
    await setLog(props.serverTab, ['del', item.label], dateFormat())
    if (item.label === state.targetKey) state.targetKey = 'Console'
  }
  await client.disconnect()
  if (searchState.isSearching) {
    await search()
  } else {
    await fetchData()
  }
  await delKeyDialogCancel()
}
const handleMonitorToggle = async () => {
  await store.dispatch('keyMenuAndTabBind/monitorToggle', props.serverTab)
}
const handlePsToggle = async () => {
  await store.dispatch('keyMenuAndTabBind/psToggle', props.serverTab)
}

onMounted(async () => {
  await fetchData()
})

watch(() => searchState.search, () => {
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
  height: calc(100vh - 65px);
  width: 100%;
  overflow-y: hidden;
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
