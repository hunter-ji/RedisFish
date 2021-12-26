<template>
  <div class="list-type-container">
    <top-tab :key-name="props.keyName" key-type="list" class="mb-4"/>
    <div class="w-full flex flex-row justify-between mb-4">
      <div
        :class="searchState.search.length !== 0 ? 'w-4/5 transition-width duration-1000 ease-in-out' : 'w-2/5 transition-width duration-500 ease-in-out'">
        <el-input v-model="searchState.search" size="small" placeholder="回车查询搜索结果" :prefix-icon="Search" clearable
                  @keyup.enter="search"/>
      </div>
      <div class="w-1/8 flex flex-row justify-between transition-width duration-200 ease-in delay-75">
        <el-button type="danger" size="small" disabled :icon="Delete" circle v-if="!state.multipleSelection.length"/>
        <el-button type="danger" size="small" :icon="Delete" round class="flex flex-row items-center" @click="del" v-else>
          ({{ state.multipleSelection.length }})
        </el-button>
        <transition name="slide-fade">
          <el-button type="info" size="small" :icon="RefreshRight" circle @click="refresh"
                     v-if="!searchState.search.length"/>
        </transition>
        <transition name="slide-fade">
          <el-button type="primary" size="small" circle @click="addRow" :icon="Plus" v-if="!searchState.search.length"/>
        </transition>
        <el-button type="success" size="small" :icon="Check" circle @click="submit"/>
      </div>
    </div>
    <el-table
      :data="searchState.isSearching ? searchState.values : state.values"
      height="700"
      size="mini" border stripe @selection-change="handleSelectionChange"
      @cell-dblclick="edit"
      style="min-width: 900px;max-width: calc(100% - 750px);">
      <el-table-column type="selection" width="40"/>
      <el-table-column type="index" width="50"/>
      <el-table-column prop="value" label="Value">
        <template #default="scope">
          <div v-if="scope.row.id === state.targetID">
            <el-input size="mini" v-model="scope.row.value" @blur="blurInput" placeholder="null"
                      @change="inputChange(scope.row)"/>
          </div>
          <div v-else>
            <div v-if="scope.row.value.length" :style="'color:' + SwitchColorWithType(scope.row.type)">
              {{ scope.row.value }}
            </div>
            <div class="text-gray-400 italic" v-else>null</div>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, PropType, reactive, watch } from 'vue'
import { commandObjectType, listTableValueType } from '@/views/valueContent/index'
import TopTab from './topTab.vue'
import { SwitchColorWithType } from '@/utils/switchColorWithType'
import { ElNotification } from 'element-plus'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Check, Delete, Plus, RefreshRight, Search } from '@element-plus/icons-vue'

const emit = defineEmits(['refresh', 'delete', 'submit'])
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
const state: { values: listTableValueType[], multipleSelection: listTableValueType[], targetID: number, commands: commandObjectType[] } = reactive({
  values: [],
  multipleSelection: [],
  targetID: 0,
  commands: []
})
const searchState: { search: string, isSearching: boolean, values: listTableValueType[] } = reactive({
  search: '',
  isSearching: false,
  values: []
})
const refresh = () => {
  state.values = []
  emit('refresh', true)
}
const handleSelectionChange = (val: listTableValueType[]) => {
  state.multipleSelection = val
}
const edit = (e: listTableValueType) => {
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
const search = () => {
  searchState.isSearching = true
  searchState.values = state.values.filter((item: listTableValueType) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return String(item.value).toLowerCase().indexOf(searchState.search.toLowerCase()) > -1 && item.type !== 'add'
  })
}
const inputChange = (row: listTableValueType) => {
  if (row.type === 'normal') {
    row.type = 'edit'
  } else if (row.type === 'edit' && row.value === row.oldValue) {
    row.type = 'normal'
  }
}
const del = () => {
  state.commands = []
  state.multipleSelection.forEach((item: listTableValueType) => {
    state.commands.push({ command: ['SREM', props.keyName, item.value] })
  })
  emit('delete', state.commands)
}
const submit = () => {
  state.commands = []
  state.values.forEach((item: listTableValueType) => {
    if (item.type === 'add' && item.value.trim().length) {
      state.commands.push({ command: ['LPUSH', props.keyName, item.value] })
    } else if (item.type === 'edit' && item.value.trim().length) {
      state.commands.push({ command: ['LPUSH', props.keyName, item.oldValue] })
      state.commands.push({ command: ['LPUSH', props.keyName, item.value] })
    }
  })

  if (state.commands.length) {
    emit('submit', state.commands)
  } else {
    ElNotification({
      title: '提示',
      message: '没有可执行的操作',
      showClose: false,
      duration: 2000
    })
  }
}

watch(searchState, () => {
  if (!searchState.search.length) searchState.isSearching = false
})
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

<style scoped>
.slide-fade-enter-active {
  transition: all 500ms ease-in;
}

.slide-fade-leave-active {
  transition: all 500ms ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(20px) rotate(45deg);
  opacity: 0;
}
</style>
