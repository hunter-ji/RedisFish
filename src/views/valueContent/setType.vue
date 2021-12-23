<template>
  <div class="list-type-container">
    <top-tab :key-name="props.keyName" key-type="set" class="mb-4"/>
    <div class="w-full flex flex-row justify-between mb-4">
      <div :class="state.search.length !== 0 ? 'w-4/5 transition-width duration-500 ease-in-out' : 'w-2/5 transition-width duration-500 ease-in-out'">
        <el-input v-model="state.search" size="small" placeholder="Search" :prefix-icon="Search" clearable/>
      </div>
      <div class="w-1/8 flex flex-row justify-between">
        <el-button type="danger" size="small" disabled :icon="Delete" circle v-if="!state.multipleSelection.length"/>
        <el-button type="danger" size="small" :icon="Delete" round class="flex flex-row items-center" v-else>
          ({{ state.multipleSelection.length }})
        </el-button>
        <el-button type="info" size="small" :icon="RefreshRight" circle @click="refresh" :disabled="state.search.length !== 0"/>
        <el-button type="primary" size="small" :icon="Plus" circle :disabled="state.search.length !== 0"/>
        <el-button type="success" size="small" :icon="Check" circle/>
      </div>
    </div>
    <el-table :data="data" size="small" border stripe @selection-change="handleSelectionChange"
              style="min-width: 900px;max-width: calc(100% - 750px);">
      <el-table-column type="selection" width="40"/>
      <el-table-column prop="value" label="Value"/>
    </el-table>
    <div class="w-full flex flex-row justify-end"
         v-show="state.values.length >= tableConfig.pageSize && !state.search.length">
      <el-pagination layout="prev, pager, next" :page-size="tableConfig.pageSize" :total="state.values.length"
                     @current-change="changeCurrent" class="p-2"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef, defineEmits, defineProps, PropType, reactive, watch } from 'vue'
import { hashTableValueType, setTableValueType } from '@/views/valueContent/index'
import TopTab from './topTab.vue'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Check, Delete, Plus, RefreshRight, Search } from '@element-plus/icons-vue'

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
const state: { search: string, values: setTableValueType[], multipleSelection: setTableValueType[] } = reactive({
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
const data: ComputedRef<setTableValueType[]> = computed(() => {
  if (state.search) {
    return state.values.filter((item: setTableValueType) => {
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
  props.values.forEach((item: string, index: number) => {
    state.values.push({
      id: index,
      value: item,
      isEdit: false
    })
  })
})
</script>
