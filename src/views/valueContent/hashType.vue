<template>
  <div class="hash-type-container flex flex-col items-center pb-4">
    <top-tab :key-name="props.keyName" key-type="hash" class="mb-4"/>
    <div class="w-full flex flex-row justify-between mb-4">
      <el-input v-model="state.search" size="small" placeholder="Search" :prefix-icon="Search" style="width: 40%;"/>
      <div class="w-1/8 flex flex-row justify-between">
        <el-button type="info" size="small" @click="refresh">刷新</el-button>
        <el-button type="danger" size="small" disabled v-if="!state.multipleSelection.length">删除</el-button>
        <el-button type="danger" size="small" v-else>删除 ({{ state.multipleSelection.length }})</el-button>
        <el-button type="primary" size="small">提交</el-button>
      </div>
    </div>
    <el-table :data="data" size="small" border stripe @selection-change="handleSelectionChange" style="min-width: 900px;max-width: calc(100% - 750px);">
      <el-table-column type="selection" width="40" />
      <el-table-column prop="field" label="Field"/>
      <el-table-column prop="value" label="Value"/>
    </el-table>
    <div class="w-full flex flex-row justify-end" v-show="state.values.length >= tableConfig.pageSize && !state.search.length">
      <el-pagination layout="prev, pager, next" :page-size="tableConfig.pageSize" :total="state.values.length"
                     @current-change="changeCurrent" class="p-2"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import TopTab from './topTab.vue'
import { computed, ComputedRef, defineProps, PropType, reactive, watch, defineEmits } from 'vue'
import { hashTableValueType } from '.'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Search } from '@element-plus/icons-vue'

const emit = defineEmits(['refresh'])
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
const state: { search: string, values: hashTableValueType[], multipleSelection: hashTableValueType[] } = reactive({
  search: '',
  values: [],
  multipleSelection: []
})
const tableConfig: { currentPage: number, pageSize: number, search: string } = reactive({
  currentPage: 1,
  pageSize: 12,
  search: ''
})
const changeCurrent = (current: number) => {
  tableConfig.currentPage = current
}
const data: ComputedRef<hashTableValueType[]> = computed(() => {
  if (state.search) {
    return state.values.filter((item: hashTableValueType) => {
      return Object.keys(item).some((key: string) => {
        return (
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          String(item[key])
            .toLowerCase()
            .indexOf(state.search) > -1
        )
      })
    })
  }
  return state.values.slice(
    (tableConfig.currentPage - 1) * tableConfig.pageSize,
    tableConfig.currentPage * tableConfig.pageSize
  )
})
const refresh = () => {
  emit('refresh', true)
}
const handleSelectionChange = (val: hashTableValueType[]) => {
  state.multipleSelection = val
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
