<template>
  <div class="list-type-container">

    <!-- top-tab -->
    <top-tab :key-name="props.keyName" key-type="set" class="mb-4"/>

    <!-- tools -->
    <div class="w-full flex flex-row justify-between mb-4">
      <div class="w-1/5 flex flex-row items-center">
        <div class="text-sm mr-1">TTL(s)</div>
        <el-input-number v-model="state.ttl" size="small" controls-position="right" :min="-1" />
      </div>
      <div
        :class="searchState.search.length !== 0 ? 'w-3/5 transition-width duration-1000 ease-in-out delay-100' : 'w-2/5 transition-width duration-500 ease-in-out'">
        <el-input v-model="searchState.search" size="small" :placeholder="t('valueContent.searchInputPlaceholder')" :prefix-icon="Search" clearable
                  @keyup.enter="search"/>
      </div>
      <div class="w-1/5 flex flex-row justify-end items-center transition-width duration-200 ease-in delay-75">
        <transition name="slide-fade">
          <div class="flex flex-row items-center" style="margin-right: 10px;" v-if="!searchState.search.length">
            <el-tooltip effect="light" :content="t('valueContent.btnGroup.refresh')" placement="bottom" :show-after="delayNumber">
              <el-button type="info" size="small" :icon="RefreshRight" circle @click="refresh" />
            </el-tooltip>
            <el-tooltip effect="light" :content="t('valueContent.btnGroup.add')" placement="bottom" :show-after="delayNumber">
              <el-button type="primary" size="small" circle @click="addRow" :icon="Plus" />
            </el-tooltip>
          </div>
        </transition>
        <el-tooltip effect="light" :content="t('valueContent.btnGroup.delete')" placement="bottom" :show-after="delayNumber">
          <el-button type="danger" size="small" disabled :icon="Delete" circle v-if="!state.multipleSelection.length"/>
          <el-button type="danger" size="small" :icon="Delete" round class="flex flex-row items-center" @click="del" v-else>
          ({{ state.multipleSelection.length }})
        </el-button>
        </el-tooltip>
        <el-tooltip effect="light" :content="t('valueContent.btnGroup.submit')" placement="bottom" :show-after="delayNumber">
          <el-button type="success" size="small" :icon="Check" circle @click="submit"/>
        </el-tooltip>
      </div>
    </div>

    <!-- table -->
    <div class="table-container">
      <el-table
        :data="searchState.isSearching ? searchState.values : state.values"
        v-loading="state.loading"
        size="small" border stripe @selection-change="handleSelectionChange"
        @cell-dblclick="edit"
        @cell-contextmenu="handleContentDetail"
        style="width: 100%;">
        <el-table-column type="selection" width="40"/>
        <el-table-column type="index" width="50"/>
        <el-table-column prop="value" label="Value">
          <template #default="scope">
            <div v-if="scope.row.id === state.targetID">
              <el-input size="small" v-model="scope.row.value" @blur="blurInput" placeholder="null" :rows="3" type="textarea"
                        @change="inputChange(scope.row)"/>
            </div>
            <div v-else>
              <div v-if="scope.row.value.length" :style="'color:' + SwitchColorWithRepeat(scope.row.isRepeat, scope.row.type)" @click="copyKey(scope.row.value)">
                {{ contentLimit(scope.row.value) }}
              </div>
              <div class="text-gray-400 italic" v-else>null</div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- content detail -->
    <el-dialog v-model="contentDetailState.isShow" width="60%" center top="10vh">
      <content-detail :message="contentDetailState.message" @update="handleDetailUpdate" @cancel="handleDetailCancel" v-if="contentDetailState.isShow" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, PropType, reactive, ref, watch } from 'vue'
import { commandObjectType, setTableValueType } from '@/views/valueContent/index'
import TopTab from './topTab.vue'
import { SwitchColorWithRepeat } from '@/utils/switchColor'
import { ElNotification } from 'element-plus'
import { contentLimit } from '@/utils/contentLimit'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Check, Delete, Plus, RefreshRight, Search } from '@element-plus/icons-vue'
import { FormatCommandField } from '@/utils/formatCommandField'
import { useI18n } from 'vue-i18n'
import { copyKey } from '@/utils/copyFromTable'
import ContentDetail from '@/components/contentDetail/index.vue'

const { t } = useI18n()
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
const state: { values: setTableValueType[], ttl: number, oldTTL: number, multipleSelection: setTableValueType[], targetID: number, commands: commandObjectType[], loading: boolean } = reactive({
  values: [],
  ttl: 0,
  oldTTL: 0,
  multipleSelection: [],
  targetID: -1,
  commands: [],
  loading: true
})
const searchState: { search: string, isSearching: boolean, values: setTableValueType[] } = reactive({
  search: '',
  isSearching: false,
  values: []
})
const contentDetailState: { isShow: boolean, message: string, row: setTableValueType } = reactive({
  isShow: false,
  message: '',
  row: {
    id: 0,
    value: '',
    oldValue: '',
    type: '',
    isRepeat: false
  }
})
const refresh = () => {
  state.loading = true
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
  state.targetID = -1
}
const addRow = () => {
  state.values.unshift({
    id: state.values.length + 1,
    value: '',
    oldValue: '',
    type: 'add',
    isRepeat: false
  })
}
const search = () => {
  searchState.isSearching = true
  searchState.values = state.values.filter((item: setTableValueType) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return String(item.value).toLowerCase().indexOf(searchState.search.toLowerCase()) > -1 && item.type !== 'add'
  })
}
const inputChange = (row: setTableValueType) => {
  if (row.type === 'normal') {
    row.type = 'edit'
  } else if (row.type === 'edit' && row.value === row.oldValue) {
    row.type = 'normal'
  }

  const index = state.values.findIndex((item: setTableValueType) => item.value === row.value && item.id !== row.id)
  if (index !== -1) {
    row.isRepeat = true
    ElNotification({
      title: t('valueContent.notification.dataDuplicationTitle'),
      message: row.value && row.value.length > 6 ? row.value.slice(0, 6) + '...' : row.value + t('valueContent.notification.dataDuplicationMessage'),
      type: 'error',
      duration: 5000
    })
  } else if (index === -1 && row.isRepeat) {
    row.isRepeat = false
  }
}
const del = () => {
  state.commands = []
  state.multipleSelection.forEach((item: setTableValueType) => {
    state.commands.push({ command: ['SREM', FormatCommandField(props.keyName), FormatCommandField(item.value)] })
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
  state.values.forEach((item: setTableValueType) => {
    if (item.type === 'add' && item.value.trim().length) {
      state.commands.push({ command: ['SADD', FormatCommandField(props.keyName), FormatCommandField(item.value)] })
    } else if (item.type === 'edit' && item.value.trim().length) {
      state.commands.push({ command: ['SREM', FormatCommandField(props.keyName), FormatCommandField(item.oldValue)] })
      state.commands.push({ command: ['SADD', FormatCommandField(props.keyName), FormatCommandField(item.value)] })
    }
  })

  if (state.commands.length) {
    emit('submit', state.commands)
  } else {
    ElNotification({
      title: t('valueContent.notification.infoTitle'),
      message: t('valueContent.notification.emptyContentMessage'),
      type: 'warning',
      duration: 2000
    })
  }
}
const handleContentDetail = (row: setTableValueType, column: { label: string }) => {
  if (column.label === 'Value') {
    contentDetailState.message = row.value
    contentDetailState.isShow = true
    contentDetailState.row = row
  }
}
const handleDetailCancel = () => {
  contentDetailState.isShow = false
  contentDetailState.message = ''
  contentDetailState.row = {
    id: 0,
    value: '',
    oldValue: '',
    type: '',
    isRepeat: false
  }
}
const handleDetailUpdate = (message: string) => {
  contentDetailState.row.value = message
  inputChange(contentDetailState.row)
  handleDetailCancel()
}

watch(searchState, () => {
  if (!searchState.search.length) searchState.isSearching = false
})
watch(props, () => {
  state.ttl = props.ttl
  state.oldTTL = props.ttl
  state.values = []
  props.values.forEach((item: string, index: number) => {
    state.values.push({
      id: index + 1,
      value: item,
      oldValue: item,
      type: 'normal',
      isRepeat: false
    })
  })
  state.loading = false
})
</script>

<style>
.table-container {
  height: calc(90vh - 180px);
  overflow-y: auto;
}
</style>
