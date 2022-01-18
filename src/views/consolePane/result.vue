<template>
  <div>
    <string-table :content="state.stringData" v-if="isString()" />
    <single-row-table :result="state.tableData" v-else-if="!isString() && isSingleRowTable()" />
    <double-row-table :result="state.doubleRowTableData" v-else-if="!isString() && !isSingleRowTable()" />
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, PropType, reactive } from 'vue'
import { outputPaneResultDoubleRowType, outputPaneResultType, outputPaneType } from '.'
import StringTable from './stringTable.vue'
import SingleRowTable from './singleRowTable.vue'
import DoubleRowTable from './doubleRowTable.vue'

const props = defineProps({
  content: {
    type: Object as PropType<outputPaneType>,
    required: true
  }
})
const state: { stringData: string, tableData: outputPaneResultType[], doubleRowTableData: outputPaneResultDoubleRowType[] } = reactive({
  stringData: '',
  tableData: [],
  doubleRowTableData: []
})
const isSingleRowTable = (): boolean => {
  const commandFirst = props.content.command.trim().split(' ')[0]
  return !(commandFirst.toLowerCase() === 'zrange' || commandFirst.toLowerCase() === 'hgetall')
}
const isString = (): boolean => {
  return typeof props.content.result === 'string'
}

onMounted(() => {
  state.tableData = []
  state.doubleRowTableData = []
  if (isString()) {
    state.stringData = props.content.result
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
