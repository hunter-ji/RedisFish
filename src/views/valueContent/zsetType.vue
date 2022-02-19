<template>
  <div class="list-type-container">
    <top-tab :key-name="props.keyName" key-type="hash" class="mb-4"/>
    <div class="w-full flex flex-row justify-between mb-4">
      <div class="w-1/5 flex flex-row items-center">
        <div class="text-sm mr-1">TTL(s)</div>
        <el-input-number v-model="state.ttl" size="mini" controls-position="right" :min="-1" />
      </div>
      <div
        :class="searchState.search.length !== 0 ? 'w-3/5 transition-width duration-1000 ease-in-out delay-100' : 'w-2/5 transition-width duration-500 ease-in-out'">
        <el-input v-model="searchState.search" size="small" placeholder="回车查询搜索结果" :prefix-icon="Search" clearable
                  @keyup.enter="search"/>
      </div>
      <div class="w-1/5 flex flex-row justify-end transition-width duration-200 ease-in delay-75">
        <transition name="slide-fade">
          <div class="flex flex-row items-center" style="margin-right: 10px;" v-if="!searchState.search.length">
            <el-tooltip effect="light" content="刷新" placement="bottom" :show-after="delayNumber">
              <el-button type="info" size="small" :icon="RefreshRight" circle @click="refresh" />
            </el-tooltip>
            <el-tooltip effect="light" content="添加" placement="bottom" :show-after="delayNumber">
              <el-button type="primary" size="small" circle @click="addRow" :icon="Plus" />
            </el-tooltip>
          </div>
        </transition>
        <el-tooltip effect="light" content="删除" placement="bottom" :show-after="delayNumber">
          <el-button type="danger" size="small" disabled :icon="Delete" circle v-if="!state.multipleSelection.length"/>
          <el-button type="danger" size="small" :icon="Delete" round class="flex flex-row items-center" @click="del" v-else>
            ({{ state.multipleSelection.length }})
          </el-button>
        </el-tooltip>
        <el-tooltip effect="light" content="提交操作" placement="bottom" :show-after="delayNumber">
          <el-button type="success" size="small" :icon="Check" circle @click="submit"/>
        </el-tooltip>
      </div>
    </div>
    <el-table
      :data="searchState.isSearching ? searchState.values : state.values"
      v-loading="state.loading"
      height="700"
      size="mini" border stripe @selection-change="handleSelectionChange"
      @cell-dblclick="edit"
      style="width: 100%;">
      <el-table-column type="selection" width="40"/>
      <el-table-column type="index" width="50"/>
      <el-table-column label="Field">
        <template #default="scope">
          <div v-if="scope.row.id === state.targetID && state.targetLabel === 'Field'">
            <el-input size="mini" v-model="scope.row.field" @blur="blurInput" placeholder="null" :rows="3"
                      type="textarea"
                      @change="inputChange(scope.row, true)"/>
          </div>
          <div v-else>
            <div v-if="scope.row.field.length" :style="'color:' + SwitchColorWithRepeat(scope.row.isRepeat, scope.row.type)">
              {{ contentLimit(scope.row.field) }}
            </div>
            <div class="text-gray-400 italic" v-else>null</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Value">
        <template #default="scope">
          <div v-if="scope.row.id === state.targetID && state.targetLabel === 'Value'">
            <el-input size="mini" v-model="scope.row.value" @blur="blurInput" placeholder="null" type="number"
                      @change="inputChange(scope.row, false)"/>
          </div>
          <div v-else>
            <div v-if="scope.row.value.length" :style="'color:' + SwitchColor(scope.row.type)">
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
import { defineEmits, defineProps, PropType, reactive, ref, watch } from 'vue'
import { commandObjectType, zsetTableValueType } from '@/views/valueContent/index'
import TopTab from './topTab.vue'
import { SwitchColorWithRepeat, SwitchColor } from '@/utils/switchColor'
import { ElNotification } from 'element-plus'
import { contentLimit } from '@/utils/contentLimit'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Check, Delete, Plus, RefreshRight, Search } from '@element-plus/icons-vue'
import { FormatCommandField } from '@/utils/formatCommandField'

const emit = defineEmits(['refresh', 'delete', 'submit'])
const props = defineProps({
  values: {
    type: Array as PropType<string[]>,
    required: true
  },
  keyName: {
    type: String,
    required: true
  },
  ttl: {
    type: Number,
    required: true
  }
})
const delayNumber = ref(1000)
const state: { values: zsetTableValueType[], ttl: number, oldTTL: number, multipleSelection: zsetTableValueType[], targetID: number, targetLabel: string, commands: commandObjectType[], loading: boolean } = reactive({
  values: [],
  ttl: 0,
  oldTTL: 0,
  multipleSelection: [],
  targetID: -1,
  targetLabel: '',
  commands: [],
  loading: false
})
const searchState: { search: string, isSearching: boolean, values: zsetTableValueType[] } = reactive({
  search: '',
  isSearching: false,
  values: []
})
const refresh = () => {
  state.loading = true
  state.values = []
  emit('refresh', true)
}
const handleSelectionChange = (val: zsetTableValueType[]) => {
  state.multipleSelection = val
}
const edit = (e: zsetTableValueType, cell: { label: string }) => {
  state.targetID = e.id
  state.targetLabel = cell.label
}
const blurInput = () => {
  state.targetID = -1
}
const addRow = () => {
  state.values.unshift({
    id: state.values.length + 1,
    field: '',
    oldField: '',
    value: '',
    oldValue: '',
    type: 'add',
    isRepeat: false
  })
}
const search = () => {
  searchState.isSearching = true
  searchState.values = state.values.filter((data: zsetTableValueType) => {
    return Object.keys(data).some(key => {
      return (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        String(data[key]).toLowerCase().indexOf(searchState.search.toLowerCase()) > -1
      )
    })
  })
}
const inputChange = (row: zsetTableValueType, isField: boolean) => {
  if (row.type === 'normal') {
    row.type = 'edit'
  } else if (row.type === 'edit' && row.field === row.oldField && row.value === row.oldValue) {
    row.type = 'normal'
  }

  if (isField) {
    const index = state.values.findIndex((item: zsetTableValueType) => item.field === row.field && item.id !== row.id)
    if (index !== -1) {
      row.isRepeat = true
      ElNotification({
        title: '数据重复',
        message: `${row.field && row.field.length > 6 ? row.field.slice(0, 6) + '...' : row.field}与现有Field重复`,
        showClose: false,
        duration: 5000
      })
    } else if (index === -1 && row.isRepeat) {
      row.isRepeat = false
    }
  }
}
const del = () => {
  state.commands = []
  state.multipleSelection.forEach((item: zsetTableValueType) => {
    state.commands.push({ command: ['HDEL', FormatCommandField(props.keyName), item.value] })
  })
  emit('delete', state.commands)
}
const submit = () => {
  state.commands = []

  // ttl
  if (state.ttl !== 0 && state.ttl !== state.oldTTL) {
    state.commands.push({ command: ['EXPIRE', FormatCommandField(props.keyName), String(state.ttl)] })
  }

  // command
  state.values.forEach((item: zsetTableValueType) => {
    if (item.type === 'add' && item.value.trim().length) {
      state.commands.push({ command: ['ZADD', FormatCommandField(props.keyName), item.value, FormatCommandField(item.field)] })
    } else if (item.type === 'edit' && item.field.trim().length && item.value.trim().length) {
      if (`'${item.field}'` === item.oldField) {
        state.commands.push({ command: ['ZADD', FormatCommandField(props.keyName), item.value, FormatCommandField(item.field)] })
      } else {
        state.commands.push({ command: ['ZREM', FormatCommandField(props.keyName), FormatCommandField(item.field)] })
        state.commands.push({ command: ['ZADD', FormatCommandField(props.keyName), item.value, FormatCommandField(item.field)] })
      }
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
  state.ttl = props.ttl
  state.oldTTL = props.ttl
  state.values = []

  let n = 0
  for (let i = 0; i < props.values.length - 1; i += 2) {
    state.values.push({
      id: n,
      field: props.values[i],
      oldField: props.values[i],
      value: props.values[i + 1],
      oldValue: props.values[i + 1],
      type: 'normal',
      isRepeat: false
    })
    n += 1
  }
  state.loading = false
})
</script>
