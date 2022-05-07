<template>
  <div class="lineChat">
    <div :id="domID" style="width:1000px;height:250px;" />
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts/core'
import { GridComponent, GridComponentOption, TooltipComponent, TooltipComponentOption } from 'echarts/components'
import { LineChart, LineSeriesOption } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { onMounted, defineProps, PropType, watch, ref } from 'vue'

echarts.use([
  TooltipComponent,
  GridComponent,
  LineChart,
  CanvasRenderer,
  UniversalTransition
])

const props = defineProps({
  data: {
    type: Object as PropType<{x: string[], yList: {y: number[], y2: number[]}, nameList: {y: string, y2: string}}>,
    required: true
  },
  yFormatter: {
    type: String,
    required: true
  }
})
const domID = ref('lineChat')

type EChartsOption = echarts.ComposeOption<TooltipComponentOption | GridComponentOption | LineSeriesOption>;
let targetDOM: HTMLElement | null = null
let myChart: echarts.ECharts | null = null

const genDomID = async () => {
  domID.value = String(Math.random().toString(36).slice(-6))
}
const initDom = async () => {
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  targetDOM = document.getElementById(domID.value)!
}
const fetchData = async () => {
  await initDom()
  if (!targetDOM) {
    return
  }

  myChart = echarts.init(targetDOM)
}
const handleOption = async () => {
  const options: EChartsOption = {
    xAxis: {
      type: 'category',
      data: props.data.x
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}' + props.yFormatter
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    series: [
      {
        data: props.data.yList.y,
        type: 'line',
        smooth: true,
        showSymbol: false,
        name: props.data.nameList.y
      },
      {
        data: props.data.yList.y2,
        type: 'line',
        smooth: true,
        showSymbol: false,
        name: props.data.nameList.y2
      }
    ]
  }

  options && myChart!.setOption(options)
}

onMounted(async () => {
  await genDomID()
  await fetchData()
  await handleOption()
})

watch(props, () => {
  handleOption()
})
</script>

<style scoped>

</style>