<template>
  <div class="container flex flex-row justify-between">

    <!--key-menu-->
    <div class="key-menu h-full overflow-y-auto">
      <el-table :data="data" style="width: 100%;" :show-header="state.showHeader" stripe @cell-click="getValue">
        <el-table-column prop="label" label="Keys" width="300"/>
      </el-table>
      <div class="flex flex-row justify-end" v-show="state.keysList.length >= state.pageSize">
        <el-pagination layout="prev, pager, next" :page-size="state.pageSize" :total="state.keysList.length"
                       @current-change="changeCurrent" class="p-2"/>
      </div>
    </div>

    <!--key-tab-->
    <key-tab class="h-full w-full" :server-tab="props.serverTab" :target-key="state.targetKey"/>
  </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef, defineProps, onMounted, PropType, reactive } from 'vue'
import { serverTabType } from '@/store/modules/serverList'
import { getClient } from '@/utils/redis'
import { useStore } from 'vuex'
import KeyTab from '@/views/keyTab/index.vue'

const props = defineProps({
  serverTab: {
    type: Object as PropType<serverTabType>,
    required: true
  }
})

const store = useStore()
const client = getClient(props.serverTab)
const state: { keysList: { label: string, value: number }[], showHeader: boolean, currentPage: number, pageSize: number, targetKey: string } = reactive({
  keysList: [],
  showHeader: false,
  currentPage: 1,
  pageSize: 20,
  targetKey: ''
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
}

const changeCurrent = (current: number) => {
  state.currentPage = current
}

const getValue = async (e: { label: string, value: number }) => {
  const { label } = e

  await addTab(label)

  await client.sendCommand(['select', props.serverTab.db.slice(-1)])
  const keyType: string = await client.sendCommand(['type', 'e'])
  console.log('keyType : ', keyType)

  const redisValue: string = await client.sendCommand(['get', label])
  console.log('redisValue : ', redisValue)
}
const addTab = async (targetName: string) => {
  await store.dispatch('keyList/add', {
    serverLabel: `${props.serverTab.db} ${props.serverTab.name}`,
    key: targetName
  })
  state.targetKey = targetName
}

const data: ComputedRef<{ label: string, value: number }[]> = computed(() => state.keysList.slice((state.currentPage - 1) * state.pageSize, state.currentPage * state.pageSize))

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.container {
  height: calc(100vh - 60px);
  width: 100%;
  overflow-y: hidden;
}

.key-menu {
  width: 300px;
}
</style>
