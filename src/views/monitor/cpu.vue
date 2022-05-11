<template>
  <div class="chart-container pb-4">
    <line-chart :data="state.dataList" y-formatter="" />
    <div class="chart-title text-center text-sm text-gray-500">CPU消耗率(%)</div>
  </div>
</template>

<script setup lang="ts">
import { getClient } from '@/utils/redis'
import { defineProps, onBeforeUnmount, onMounted, PropType, reactive } from 'vue'
import { serverTabType } from '@/store/modules/serverList'
import LineChart from './chart.vue'
import { timeFormat } from '@/utils/formatTime'

const props = defineProps({
  serverTab: {
    type: Object as PropType<serverTabType>,
    required: true
  }
})

const state: { dataList: { x: string[], y: number[] }, usedCpuSysBefore: number } = reactive({
  dataList: { x: [], y: [] },
  usedCpuSysBefore: 0
})
// eslint-disable-next-line no-undef
let theInterval: NodeJS.Timer

const client = getClient(props.serverTab)
const fetchData = async () => {
  await client.connect()
  await client.sendCommand(['select', props.serverTab.db.slice(-1)])

  const data = await client.sendCommand(['info', 'cpu'])
  const infoArr = data.split('\r\n')

  for (let index = 0; index < infoArr.length; index++) {
    const item = infoArr[index]
    if (index && item.length) {
      const tmpArr = item.split(':')
      if (tmpArr.length === 2) {
        const label = tmpArr[0]
        const value = tmpArr[1]
        if (label === 'used_cpu_sys') {
          if (!state.usedCpuSysBefore) {
            state.usedCpuSysBefore = value
          } else {
            // 计算cpu消耗率
            const result = ((value - state.usedCpuSysBefore) / 10) * 100
            state.usedCpuSysBefore = value
            state.dataList.x.push(timeFormat())
            state.dataList.y.push(Number(result.toFixed(2)))
          }
        }
      }
    }
  }

  await client.disconnect()
}
const createInterval = () => {
  theInterval = setInterval(() => {
    fetchData()
  }, 10000)
}
const destroyInterval = () => {
  clearInterval(theInterval)
}

onMounted(() => {
  fetchData()
  createInterval()
})

onBeforeUnmount(() => {
  destroyInterval()
})
</script>

<style scoped>
.chart-container {
  border: 1px solid #EBEEF5;
  border-radius: 4px;
}
.chart-container:hover {
  border-color: #E4E7ED;
}
</style>
