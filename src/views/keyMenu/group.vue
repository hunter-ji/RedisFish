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

      <!--keys table-->
      <el-table
        :data="searchState.isSearching ? searchState.keysList : state.keysList"
        size="small" height="90%" style="width: 400px;"
        class="group-key-menu pb-4"
        v-loading="state.loading"
        row-key="label"
        :expand-row-keys="tableState.expands"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" :selectable="handleSelect"/>
        <el-table-column prop="label" label="Key" width="350">
          <template #default="scope">
            <div
              @click.left.meta.exact="copyKey(scope.row.label, t('valueContent.notification.copySuccessMessage'))"
              @click.left.ctrl.exact="copyKey(scope.row.label, t('valueContent.notification.copySuccessMessage'))"
              @click.left.exact="getValue(scope.row.label, scope.row.isKey)"
              v-if="scope.row.isKey"
              class="cursor-default"
            >
              {{ scope.row.label }}
            </div>
            <div v-else class="cursor-default w-full" @click="handleExpand(scope.row)">
              {{ `${scope.row.label} (${scope.row.count})` }}
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
import { keyMenuWithGroupType, keyMenuWithGroupChildType } from '@/views/valueContent/index'
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
const state: { keysList: keyMenuWithGroupType[], originKeysList: string[], targetKey: string, multipleSelection: keyMenuWithGroupChildType[], loading: boolean } = reactive({
  keysList: [],
  originKeysList: [],
  targetKey: '',
  multipleSelection: [],
  loading: true
})
const searchState: { keysList: keyMenuWithGroupChildType[], search: string, isSearching: boolean } = reactive({
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
const tableState: { expands: string[] } = reactive({
  expands: []
})
const changeLoading = async (status: boolean) => {
  state.loading = status
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
const handleKeyMenuFilter = async (label: string): Promise<string> => {
  const filterReg = new RegExp(`[\\da-zA-Z]+(?=[${store.getters.keyMenuFilterSymbolStr}])`)
  const preArr = filterReg.exec(label)
  if (preArr && Object.keys(preArr).length >= 2) {
    return preArr[0]
  }
  return ''
}
const handleGroupKeys = async (keys: string[]) => {
  state.keysList = []
  const otherGroupChildren: keyMenuWithGroupChildType[] = []
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index]

    // traverse each key, whether there is a prefix
    const preStr = await handleKeyMenuFilter(key)
    if (preStr !== '') {
      // prefixed
      // determine whether the prefix exists, put it in the sub-item if it exists, create a new one if it does not exist, and then put it in the sub-item
      const keysListIndex = state.keysList.findIndex((item: keyMenuWithGroupType) => item.label === preStr)
      if (keysListIndex === -1) {
        state.keysList.push({
          label: preStr,
          value: index + 1000,
          count: 1,
          isKey: false,
          children: [{
            label: key,
            value: index,
            isKey: true
          }]
        })
      } else {
        state.keysList[keysListIndex].children.push({
          label: key,
          value: index,
          isKey: true
        })
        state.keysList[keysListIndex].count += 1
      }
    } else {
      // put into the other group without a prefix
      otherGroupChildren.push({
        label: key,
        value: index,
        isKey: true
      })
    }
  }

  state.keysList.push({
    label: 'other',
    value: state.keysList.length,
    count: otherGroupChildren.length,
    isKey: false,
    children: otherGroupChildren
  })
}
const fetchData = async () => {
  const dbIndex = props.serverTab.db.slice(-1)
  await changeLoading(true)
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
    state.originKeysList = keys

    await handleGroupKeys(keys)
  }

  await client.disconnect()
  await changeLoading(false)
}
const handlePageChange = async () => {
  const dbIndex = props.serverTab.db.slice(-1)
  await changeLoading(true)
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
    state.originKeysList = keys

    await handleGroupKeys(keys)
  }

  await client.disconnect()
  await changeLoading(false)
}
const getValue = async (label: string, isKey: boolean) => {
  if (isKey) {
    await addTab(label)
  }
}
const addTab = async (targetName: string) => {
  await store.dispatch('keyList/add', {
    serverLabel: `${props.serverTab.db} ${props.serverTab.name}`,
    key: targetName
  })
  state.targetKey = targetName
}
const handleSelectionChange = (val: keyMenuWithGroupChildType[]) => {
  state.multipleSelection = val.filter((item: keyMenuWithGroupChildType) => item.isKey)
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
    searchState.keysList.push({
      label: keys[index],
      value: index,
      isKey: true
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
const handleSelect = (row: { isKey: boolean }): boolean => {
  return row.isKey
}
const handleExpand = (row: { label: string }) => {
  if (tableState.expands.includes(row.label)) {
    tableState.expands = tableState.expands.filter((item: string) => item !== row.label)
  } else {
    tableState.expands.push(row.label)
  }
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

watch(() => store.getters.keyMenuFilterSymbolStr, async () => {
  await handleGroupKeys(state.originKeysList)
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

<style scoped>
/deep/ .el-table .cell {
  display: flex;
  flex-direction: row;
  align-items: center;
}
/deep/ .el-table__header-wrapper .el-checkbox {
  display: none;
}
</style>
