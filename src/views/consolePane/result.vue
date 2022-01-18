<template>
  <div>
    <single-row-table :result="state.tableData" v-if="isSingleRowTable()" />
    <double-row-table :result="state.doubleRowTableData" v-else />
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, PropType, reactive } from 'vue'
import { outputPaneResultDoubleRowType, outputPaneResultType, outputPaneType } from '.'
import SingleRowTable from './singleRowTable.vue'
import DoubleRowTable from './doubleRowTable.vue'

const props = defineProps({
  content: {
    type: Object as PropType<outputPaneType>,
    required: true
  }
})

const state: { tableData: outputPaneResultType[], doubleRowTableData: outputPaneResultDoubleRowType[] } = reactive({
  tableData: [],
  doubleRowTableData: []
})

const isSingleRowTable = (): boolean => {
  const commandFirst = props.content.command.trim().split(' ')[0]
  return !(commandFirst.toLowerCase() === 'zrange' || commandFirst.toLowerCase() === 'hgetall')
}

onMounted(() => {
  console.log(props.content.result)
  state.tableData = []
  state.doubleRowTableData = []
  if (typeof props.content.result === 'string') {
    state.tableData.push({
      value: props.content.result
    })
  } else {
    if (isSingleRowTable()) {
      for (const item of props.content.result) {
        state.tableData.push({
          value: item
        })
      }
    } else {
      let n = 0
      for (let i = 0; i < props.content.result.length - 1; i += 2) {
        state.doubleRowTableData.push({
          field: props.content.result[i],
          value: props.content.result[i + 1]
        })
        n += 1
      }
    }
  }
})
</script>
