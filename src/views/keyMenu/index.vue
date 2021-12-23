<template>
  <div class="key-menu-container flex flex-row justify-between">
    <!--key-menu-->
    <div>
      <div class="key-menu-tool p-2 flex flex-row is-text justify-between">
        <!--search-->
        <div
          :class="state.search.length ? 'w-full transition-width duration-1000 ease-in-out delay-200' : 'w-3/5 transition-width duration-1000 ease-in-out'">
          <el-input v-model="state.search" size="small" placeholder="Search" clearable :prefix-icon="Search"/>
        </div>

        <!--btn group-->
        <div class="flex flex-row items-center justify-end ml-5">
          <el-button type="danger" size="mini" disabled :icon="Delete" circle v-if="!state.multipleSelection.length"/>
          <el-button type="danger" size="mini" :icon="Delete" round class="flex flex-row items-center" v-else>
            ({{ state.multipleSelection.length }})
          </el-button>
          <transition name="slide-fade">
            <el-button type="info" size="mini" :icon="RefreshRight" circle @click="fetchData"
                       v-if="!state.search.length"/>
          </transition>
          <transition name="slide-fade">
            <el-button type="primary" size="mini" :icon="Plus" circle v-if="!state.search.length"/>
          </transition>
        </div>
      </div>

      <div class="key-menu overflow-y-auto">
        <el-table :data="data" size="mini" style="width: 100%;" stripe @cell-dblclick="getValue"
                  @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50"/>
          <el-table-column prop="label" label="Keys" width="350"/>
        </el-table>
        <div class="flex flex-row justify-end" v-show="state.keysList.length >= state.pageSize">
          <el-pagination layout="prev, pager, next" :page-size="state.pageSize" :total="state.keysList.length"
                         @current-change="changeCurrent" class="p-2"/>
        </div>
      </div>
    </div>

    <!--key-tab-->
    <key-tab class="key-tab h-full w-full" :server-tab="props.serverTab" :target-key="state.targetKey"/>
  </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef, defineProps, onMounted, PropType, reactive } from 'vue'
import { serverTabType } from '@/store/modules/serverList'
import { getClient } from '@/utils/redis'
import { useStore } from 'vuex'
import { Delete, Plus, RefreshRight, Search } from '@element-plus/icons-vue'
import KeyTab from '@/views/keyTab/index.vue'
import { keyMenuType } from '.'

const props = defineProps({
  serverTab: {
    type: Object as PropType<serverTabType>,
    required: true
  }
})

const store = useStore()
const client = getClient(props.serverTab)
const state: { keysList: keyMenuType[], currentPage: number, pageSize: number, targetKey: string, search: string, multipleSelection: string[] } = reactive({
  keysList: [],
  currentPage: 1,
  pageSize: 20,
  targetKey: '',
  search: '',
  multipleSelection: []
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

const changeCurrent = (current: number) => {
  state.currentPage = current
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

const data: ComputedRef<{ label: string, value: number }[]> = computed(() => {
  if (state.search) {
    return state.keysList.filter((item: keyMenuType) => {
      return item.label.toLowerCase().indexOf(state.search.toLowerCase()) > -1
    })
  }
  return state.keysList.slice((state.currentPage - 1) * state.pageSize, state.currentPage * state.pageSize)
})
const handleSelectionChange = (val: string[]) => {
  state.multipleSelection = val
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
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
  transform: translateX(20px) rotate(45deg);
  opacity: 0;
}
</style>
