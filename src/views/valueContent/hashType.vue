<template>
  <div class="flex flex-col justify-center items-center">
    <top-tab :key-name="props.keyName" key-type="hash" class="mb-4"/>
    <el-table :data="state.values" border stripe style="min-width: 1000px;max-width: 100%">
      <el-table-column prop="field" label="Field"/>
      <el-table-column prop="value" label="Value"/>
    </el-table>
    <div class="flex flex-row justify-end" v-show="state.values.length >= tableConfig.pageSize">
      <el-pagination layout="prev, pager, next" :page-size="tableConfig.pageSize" :total="state.values.length"
                     @current-change="changeCurrent" class="p-2"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import TopTab from './topTab.vue'
import { defineProps, PropType, reactive, watch } from 'vue'

const props = defineProps({
  values: {
    type: Array as PropType<string[]>,
    required: true
  },
  keyName: {
    type: String,
    required: true
  }
})
const state: { values: { field: string, value: string }[] } = reactive({
  values: []
})
const tableConfig: { currentPage: number, pageSize: number, search: string } = reactive({
  currentPage: 1,
  pageSize: 20,
  search: ''
})
const changeCurrent = (current: number) => {
  tableConfig.currentPage = current
}

watch(props, () => {
  for (let i = 0; i < props.values.length - 1; i += 2) {
    state.values.push({
      field: props.values[i],
      value: props.values[i + 1]
    })
  }
})
</script>

<style scoped>
</style>
