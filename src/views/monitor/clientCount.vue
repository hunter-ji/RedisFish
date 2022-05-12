<template>
  <div class="chart-container pb-4">
    <line-chart :data="state.dataList" y-formatter="" />
    <div class="chart-title text-center text-sm text-gray-500">{{ t('monitor.clientCount') }}</div>
  </div>
</template>

<script setup lang="ts">
import { getClient } from '@/utils/redis'
import { defineProps, onBeforeUnmount, onMounted, PropType, reactive } from 'vue'
import { serverTabType } from '@/store/modules/serverList'
import LineChart from './chartWithTwoLine.vue'
import { timeFormat } from '@/utils/formatTime'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  serverTab: {
    type: Object as PropType<serverTabType>,
    required: true
  }
})

const state: { dataList: { x: string[], yList: { y: number[], y2: number[] }, nameList: { y: string, y2: string } } } = reactive({
  dataList: { x: [], yList: { y: [], y2: [] }, nameList: { y: t('monitor.clientCountLegend1'), y2: t('monitor.clientCountLegend2') } }
})
// eslint-disable-next-line no-undef
let theInterval: NodeJS.Timer

const client = getClient(props.serverTab)
const fetchData = async () => {
  await client.connect()
  await client.sendCommand(['select', props.serverTab.db.slice(-1)])

  const data = await client.sendCommand(['info', 'clients'])
  const infoArr = data.split('\r\n')

  const nowTime = timeFormat()

  for (let index = 0; index < infoArr.length; index++) {
    const item = infoArr[index]
    if (index && item.length) {
      const tmpArr = item.split(':')
      if (tmpArr.length === 2) {
        const label = tmpArr[0]
        const value = tmpArr[1]
        if (label === 'connected_clients') {
          state.dataList.x.push(nowTime)
          state.dataList.yList.y.push(value)
        } else if (label === 'blocked_clients') {
          state.dataList.yList.y2.push(value)
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
