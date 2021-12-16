<template>
  <div class="container overflow-y-hidden">

    <!--key-menu-->
    <el-table :data="state.keysList" :show-header="state.showHeader" border style="width: 180px">
      <el-table-column prop="label" label="Keys" width="180"/>
    </el-table>

    <!--key-tab-->
    <div class="key-tab"></div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, PropType, reactive } from 'vue'
import { serverTabType } from '@/store/modules/serverList'
import { getClient } from '@/utils/redis'

const props = defineProps({
  serverTab: {
    type: Object as PropType<serverTabType>,
    required: true
  }
})

const state: { keysList: { label: string, value: number }[], showHeader: boolean } = reactive({
  keysList: [],
  showHeader: false
})

const fetchData = async () => {
  const client = getClient(props.serverTab)
  client.on('error', (err: string) => console.log('Redis Client Error', err))
  await client.connect()
  await client.sendCommand(['select', props.serverTab.db.slice(-1)])
  const keys: string[] = await client.sendCommand(['keys', '*'])
  keys.forEach((item: string, index: number) => {
    state.keysList.push({ label: item, value: index })
  })
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>

</style>
