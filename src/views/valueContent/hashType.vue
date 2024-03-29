<template>
  <div class="value-content-container list-type-container">

    <!-- top-tab -->
    <top-tab :key-name="props.keyName" key-type="hash" class="mb-4"/>

    <!-- tools -->
    <div class="w-full flex flex-row justify-between mb-4">
      <div class="w-1/5 flex flex-row items-center">
        <div class="text-sm mr-1">TTL(s)</div>
        <el-input-number v-model="state.ttl" size="small" controls-position="right" :min="-1"/>
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
              <el-button type="info" size="small" :icon="RefreshRight" circle @click="refresh"/>
            </el-tooltip>
            <el-tooltip effect="light" :content="t('valueContent.btnGroup.add')" placement="bottom" :show-after="delayNumber">
              <el-button type="primary" size="small" circle @click="addRow" :icon="Plus"/>
            </el-tooltip>
          </div>
        </transition>
        <el-tooltip effect="light" :content="t('valueContent.btnGroup.delete')" placement="bottom" :show-after="delayNumber">
          <el-button type="danger" size="small" disabled :icon="Delete" circle v-if="!state.multipleSelection.length"/>
          <el-button type="danger" size="small" :icon="Delete" round class="flex flex-row items-center" @click="del"
                     v-else>
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
        size="small" border stripe
        @selection-change="handleSelectionChange"
        @cell-contextmenu="handleContentDetail"
        style="width: 100%;">
        <el-table-column type="selection" width="40"/>
        <el-table-column type="index" width="50"/>
        <el-table-column label="Field">
          <template #default="scope">
            <div v-if="scope.row.id === state.targetID && state.targetLabel === 'Field'">
              <el-input size="small" v-model="scope.row.field" @blur="blurInput" placeholder="null" :rows="3"
                        type="textarea"
                        :id="`hash-row-input-${scope.row.id}`"
                        @change="inputChange(scope.row, true)"/>
            </div>
            <div v-else>
              <div v-if="scope.row.field.length"
                   :style="'color:' + SwitchColorWithRepeat(scope.row.isRepeat, scope.row.type)"
                   @click.left.meta.exact="copyKey(scope.row.field, t('valueContent.notification.copySuccessMessage'))"
                   @click.left.ctrl.exact="copyKey(scope.row.field, t('valueContent.notification.copySuccessMessage'))"
                   @dblclick.left.exact="handleRowEdit(scope.row.id, 'Field')"
              >
                {{ contentLimit(scope.row.field) }}
              </div>
              <div class="text-gray-400 italic" v-else @dblclick.left.exact="handleRowEdit(scope.row.id, 'Field')">null</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Value">
          <template #default="scope">
            <div v-if="scope.row.id === state.targetID && state.targetLabel === 'Value'">
              <el-input size="small" v-model="scope.row.value" @blur="blurInput" placeholder="null" :rows="3"
                        type="textarea"
                        :id="`hash-row-input-${scope.row.id}`"
                        @change="inputChange(scope.row, false)"/>
            </div>
            <div v-else>
              <div v-if="scope.row.value.length" :style="'color:' + SwitchColor(scope.row.type)"
                   @click.left.meta.exact="copyKey(scope.row.value, t('valueContent.notification.copySuccessMessage'))"
                   @click.left.ctrl.exact="copyKey(scope.row.value, t('valueContent.notification.copySuccessMessage'))"
                   @dblclick.left.exact="handleRowEdit(scope.row.id, 'Value')"
              >
                {{ contentLimit(scope.row.value) }}
              </div>
              <div class="text-gray-400 italic" v-else @dblclick.left.exact="handleRowEdit(scope.row.id, 'Value')">null</div>
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
import { commandObjectType, hashTableValueType } from '@/views/valueContent/index'
import TopTab from './topTab.vue'
import { SwitchColor, SwitchColorWithRepeat } from '@/utils/switchColor'
import { ElNotification } from 'element-plus'
import { contentLimit } from '@/utils/contentLimit'
import { Check, Delete, Plus, RefreshRight, Search } from '@element-plus/icons-vue'
import { FormatCommandField } from '@/utils/formatCommandField'
import { copyKey } from '@/utils/copyFromTable'
import ContentDetail from '@/components/contentDetail/index.vue'
import { useI18n } from 'vue-i18n'

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
const state: { values: hashTableValueType[], ttl: number, oldTTL: number, multipleSelection: hashTableValueType[], targetID: number, targetLabel: string, commands: commandObjectType[], loading: boolean } = reactive({
  values: [],
  ttl: 0,
  oldTTL: 0,
  multipleSelection: [],
  targetID: -1,
  targetLabel: '',
  commands: [],
  loading: true
})
const searchState: { search: string, isSearching: boolean, values: hashTableValueType[] } = reactive({
  search: '',
  isSearching: false,
  values: []
})
const contentDetailState: { isShow: boolean, message: string, isField: boolean, row: hashTableValueType } = reactive({
  isShow: false,
  message: '',
  isField: true,
  row: {
    id: 0,
    field: '',
    oldField: '',
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
const handleSelectionChange = (val: hashTableValueType[]) => {
  state.multipleSelection = val
}
const handleRowEdit = (id: number, label: string) => {
  state.targetID = id
  state.targetLabel = label
  setTimeout(() => {
    const dom = document.getElementById(`hash-row-input-${id}`)
    if (dom) {
      dom.focus()
    }
  }, 100)
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
  searchState.values = state.values.filter((data: hashTableValueType) => {
    return Object.keys(data).some(key => {
      return (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        String(data[key]).toLowerCase().indexOf(searchState.search.toLowerCase()) > -1
      )
    })
  })
}
const inputChange = (row: hashTableValueType, isField: boolean) => {
  if (row.type === 'normal') {
    row.type = 'edit'
  } else if (row.type === 'edit' && row.field === row.oldField && row.value === row.oldValue) {
    row.type = 'normal'
  }

  if (isField) {
    const index = state.values.findIndex((item: hashTableValueType) => item.field === row.field && item.id !== row.id)
    if (index !== -1) {
      row.isRepeat = true
      ElNotification({
        title: t('valueContent.notification.dataDuplicationTitle'),
        message: row.field && row.field.length > 6 ? row.field.slice(0, 6) + '...' : row.field + t('valueContent.notification.dataDuplicationMessage'),
        type: 'error',
        duration: 5000
      })
    } else if (index === -1 && row.isRepeat) {
      row.isRepeat = false
    }
  }
}
const del = () => {
  state.commands = []
  state.multipleSelection.forEach((item: hashTableValueType) => {
    state.commands.push({ command: ['HDEL', FormatCommandField(props.keyName), FormatCommandField(item.oldField)] })
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
  state.values.forEach((item: hashTableValueType) => {
    if (item.type === 'add' && item.value.length) {
      state.commands.push({ command: ['HSETNX', FormatCommandField(props.keyName), FormatCommandField(item.field), FormatCommandField(item.value)] })
    } else if (item.type === 'edit' && item.field.length && item.value.length) {
      if (item.field === item.oldField) {
        state.commands.push({ command: ['HSET', FormatCommandField(props.keyName), FormatCommandField(item.field), FormatCommandField(item.value)] })
      } else {
        state.commands.push({ command: ['HDEL', FormatCommandField(props.keyName), FormatCommandField(item.oldField)] })
        state.commands.push({ command: ['HSETNX', FormatCommandField(props.keyName), FormatCommandField(item.field), FormatCommandField(item.value)] })
      }
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
const handleContentDetail = (row: hashTableValueType, column: { label: string }) => {
  if (column.label === 'Field') {
    contentDetailState.message = row.field
    contentDetailState.isField = true
    contentDetailState.isShow = true
    contentDetailState.row = row
  } else if (column.label === 'Value') {
    contentDetailState.message = row.value
    contentDetailState.isField = false
    contentDetailState.isShow = true
    contentDetailState.row = row
  }
}
const handleDetailCancel = () => {
  contentDetailState.isShow = false
  contentDetailState.message = ''
  contentDetailState.isField = true
  contentDetailState.row = {
    id: 0,
    field: '',
    oldField: '',
    value: '',
    oldValue: '',
    type: '',
    isRepeat: false
  }
}
const handleDetailUpdate = (message: string) => {
  if (contentDetailState.isField) {
    contentDetailState.row.field = message
  } else {
    contentDetailState.row.value = message
  }
  inputChange(contentDetailState.row, contentDetailState.isField)
  handleDetailCancel()
}

watch(() => searchState.search, () => {
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
