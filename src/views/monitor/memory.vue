<template>
  <div class="chart-container pb-4">
    <line-chart :data="state.dataList" y-formatter="MB" />
    <div class="chart-title text-center text-sm text-gray-500">{{ t('monitor.memory') }}(MB)</div>
  </div>
</template>

<script setup lang="ts">
import { getClientWithDB } from '@/utils/redis'
import { defineProps, onBeforeUnmount, onMounted, PropType, reactive } from 'vue'
import { serverTabType } from '@/store/modules/serverList'
import LineChart from './chart.vue'
import { timeFormat } from '@/utils/formatTime'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  serverTab: {
    type: Object as PropType<serverTabType>,
    required: true
  }
})

const state: { dataList: { x: string[], y: number[] } } = reactive({
  dataList: { x: [], y: [] }
})
// eslint-disable-next-line no-undef
let theInterval: NodeJS.Timer

const client = getClientWithDB(props.serverTab)
const fetchData = async () => {
  await client.connect()

  const data = await client.sendCommand(['info', 'memory'])
  const infoArr = data.split('\r\n')

  for (let index = 0; index < infoArr.length; index++) {
    const item = infoArr[index]
    if (index && item.length) {
      const tmpArr = item.split(':')
      if (tmpArr.length === 2) {
        const label = tmpArr[0]
        const value = tmpArr[1]
        if (label === 'used_memory_rss_human' && value.endsWith('M')) {
          state.dataList.x.push(timeFormat())
          state.dataList.y.push(Number(value.substring(0, value.length - 1)))
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
