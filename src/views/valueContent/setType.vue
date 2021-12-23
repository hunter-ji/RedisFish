<template>
  <div class="list-type-container">
    <top-tab :key-name="props.keyName" key-type="set" class="mb-4"/>
    <div class="w-full flex flex-row justify-between mb-4">
      <div
        :class="state.search.length !== 0 ? 'w-4/5 transition-width duration-500 ease-in-out' : 'w-2/5 transition-width duration-500 ease-in-out'">
        <el-input v-model="state.search" size="small" placeholder="Search" :prefix-icon="Search" clearable/>
      </div>
      <div class="w-1/8 flex flex-row justify-between">
        <el-button type="danger" size="small" disabled :icon="Delete" circle v-if="!state.multipleSelection.length"/>
        <el-button type="danger" size="small" :icon="Delete" round class="flex flex-row items-center" v-else>
          ({{ state.multipleSelection.length }})
        </el-button>
        <el-button type="info" size="small" :icon="RefreshRight" circle @click="refresh"/>
        <el-button type="primary" size="small" circle @click="addRow" :icon="Plus" />
        <el-button type="success" size="small" :icon="Check" circle @click="submit"/>
      </div>
    </div>
    <el-table
      :data="state.values"
      height="700"
      size="mini" border stripe @selection-change="handleSelectionChange"
      @cell-dblclick="edit"
      style="min-width: 900px;max-width: calc(100% - 750px);">
      <el-table-column type="selection" width="40"/>
      <el-table-column type="index" width="50"/>
      <el-table-column prop="value" label="Value">
        <template #default="scope">
          <div v-if="scope.row.id === state.targetID">
            <el-input size="mini" v-model="scope.row.value" @blur="blurInput" placeholder="value..." @change="inputChange(scope.row)" />
          </div>
          <div v-else>
            <div v-if="scope.row.value.length">{{ scope.row.value }}</div>
            <div class="text-gray-400 italic" v-else>null</div>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, PropType, reactive, watch } from 'vue'
import { setTableValueType } from '@/views/valueContent/index'
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
const state: { search: string, values: setTableValueType[], multipleSelection: setTableValueType[], targetID: number, commands: any } = reactive({
  search: '',
  values: [],
  multipleSelection: [],
  targetID: 0,
  commands: []
})
const refresh = () => {
  state.values = []
  emit('refresh', true)
}
const handleSelectionChange = (val: setTableValueType[]) => {
  state.multipleSelection = val
}
const edit = (e: setTableValueType) => {
  state.targetID = e.id
}
const blurInput = () => {
  state.targetID = 0
}
const addRow = () => {
  state.values.unshift({
    id: state.values.length + 1,
    value: '',
    oldValue: '',
    type: 'add'
  })
}
const inputChange = (row: setTableValueType) => {
  if (row.type === 'normal') {
    row.type = 'edit'
  }
}
const submit = () => {
  state.commands = []
  state.values.forEach((item: setTableValueType) => {
    if (item.type === 'add') {
      state.commands.push(['SADD', props.keyName, item.value])
    } else if (item.type === 'edit') {
      state.commands.push(['SREM', props.keyName, item.oldValue])
      state.commands.push(['SADD', props.keyName, item.value])
    }
  })
  console.log(state.commands)
}

watch(props, () => {
  props.values.forEach((item: string, index: number) => {
    state.values.push({
      id: index + 1,
      value: item,
      oldValue: item,
      type: 'normal'
    })
  })
})
</script>
