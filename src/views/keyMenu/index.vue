<template>
  <div class="key-menu-container flex flex-row justify-between">
    <!--key-menu-->
    <div class="flex flex-col just items-center">
      <div class="key-menu-tool w-full p-2 flex flex-row is-text justify-between">
        <!--search-->
        <div
          :class="searchState.search.length ? 'w-3/4 transition-width duration-1000 ease-in-out delay-200' : 'w-2/4 transition-width duration-1000 ease-in-out'">
          <el-input v-model="searchState.search" size="small" placeholder="回车查询搜索结果" clearable :prefix-icon="Search" @keyup.enter="search"/>
        </div>

        <!--btn group-->
        <div class="flex flex-row items-center justify-end w-1/4">
          <transition name="slide-fade">
            <div class="flex flex-row items-center justify-end" v-if="!searchState.search.length" style="margin-right: 10px;">
              <el-tooltip effect="light" content="刷新" placement="bottom" :show-after="1000">
                <el-button type="info" size="mini" :icon="RefreshRight" circle @click="fetchData"/>
              </el-tooltip>
              <el-tooltip effect="light" content="新增" placement="bottom" :show-after="1000">
                <el-button type="primary" size="mini" :icon="Plus" circle/>
              </el-tooltip>
            </div>
          </transition>
          <el-tooltip effect="light" content="删除" placement="bottom" :show-after="1000">
            <el-button type="danger" size="mini" disabled :icon="Delete" circle v-if="!state.multipleSelection.length"/>
            <el-button type="danger" size="mini" :icon="Delete" round class="flex flex-row items-center" v-else>
              ({{ state.multipleSelection.length }})
            </el-button>
          </el-tooltip>
        </div>
      </div>

      <el-table :data="searchState.isSearching ? searchState.keysList : state.keysList" size="mini" height="100%" style="width: 100%;" stripe @cell-dblclick="getValue"
                @selection-change="handleSelectionChange" class="pb-4">
        <el-table-column type="selection" width="50"/>
        <el-table-column prop="label" label="Keys" width="350"/>
      </el-table>
    </div>

    <!--key-tab-->
    <key-tab class="key-tab h-full w-full" :server-tab="props.serverTab" :target-key="state.targetKey"/>
  </div>
</template>

<script setup lang="ts">
import { defineProps, nextTick, onMounted, PropType, reactive, watch, ref } from 'vue'
import { serverTabType } from '@/store/modules/serverList'
import { getClient } from '@/utils/redis'
import { useStore } from 'vuex'
import { Delete, Plus, RefreshRight, Search } from '@element-plus/icons-vue'
import KeyTab from '@/views/keyTab/index.vue'
import { keyMenuType } from '@/views/valueContent/index'

const props = defineProps({
  serverTab: {
    type: Object as PropType<serverTabType>,
    required: true
  }
})

const store = useStore()
const client = getClient(props.serverTab)
const state: { keysList: keyMenuType[], targetKey: string, multipleSelection: string[] } = reactive({
  keysList: [],
  targetKey: '',
  multipleSelection: []
})
const searchState: {keysList: keyMenuType[], search: string, isSearching: boolean} = reactive({
  keysList: [],
  search: '',
  isSearching: false
})
const fetchData = async () => {
  client.on('error', (err: string) => console.log('Redis Client Error', err))
  await client.connect()
  await client.sendCommand(['select', props.serverTab.db.slice(-1)])
  const keys: string[] = await client.sendCommand(['keys', '*'])
  keys.forEach((item: string, index: number) => {
    state.keysList.push({
      label: item,
      value: index
    })
  })
  await client.disconnect()
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
  await client.connect()
  await client.sendCommand(['select', props.serverTab.db.slice(-1)])
  const keys: string[] = await client.sendCommand(['keys', `*${searchState.search}*`])
  keys.forEach((item: string, index: number) => {
    searchState.keysList.push({
      label: item,
      value: index
    })
  })
  await client.disconnect()
}
const tableHeight = ref(850)

nextTick(() => {
  tableHeight.value = window.innerHeight - 90
})

onMounted(() => {
  fetchData()
})

watch(searchState, () => {
  if (!searchState.search.length) {
    searchState.isSearching = false
    searchState.keysList = []
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
