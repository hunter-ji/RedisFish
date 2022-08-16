<template>
  <div class="value-content-container list-type-container">

    <!-- tools -->
    <div class="w-full flex flex-row justify-between mb-4">
      <div class="w-1/5 flex flex-row items-center">
        <div class="text-sm mr-1">TTL(s)</div>
        <el-input-number v-model="state.ttl" size="small" controls-position="right" :min="-1"/>
      </div>
      <div class="w-1/5 flex flex-row justify-end transition-width duration-200 ease-in delay-75">
          <el-tooltip effect="light" :content="t('newKeyValue.btnGroup.add')" placement="bottom" :show-after="delayNumber">
            <el-button type="primary" size="small" circle @click="addRow" :icon="Plus"/>
          </el-tooltip>
        <el-tooltip effect="light" :content="t('newKeyValue.btnGroup.delete')" placement="bottom" :show-after="delayNumber">
          <el-button type="danger" size="small" disabled :icon="Delete" circle v-if="!state.multipleSelection.length"/>
          <el-button type="danger" size="small" :icon="Delete" round class="flex flex-row items-center" @click="del"
                     v-else>
            ({{ state.multipleSelection.length }})
          </el-button>
        </el-tooltip>
        <el-tooltip effect="light" :content="t('newKeyValue.btnGroup.submit')" placement="bottom" :show-after="delayNumber">
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
              <div v-if="scope.row.value.length"
                   :style="'color:' + SwitchColor(scope.row.type)"
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
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, onMounted, reactive, ref } from 'vue'
import { commandObjectType, hashTableValueType } from '@/views/valueContent/index'
import { SwitchColor, SwitchColorWithRepeat } from '@/utils/switchColor'
import { ElNotification } from 'element-plus'
import { contentLimit } from '@/utils/contentLimit'
import { Check, Delete, Plus } from '@element-plus/icons-vue'
import { FormatCommandField } from '@/utils/formatCommandField'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const emit = defineEmits(['submit'])
const props = defineProps({
  keyName: {
    type: String,
    required: true
  }
})
const delayNumber = ref(1000)
const state: { values: hashTableValueType[], ttl: number, multipleSelection: hashTableValueType[], targetID: number, targetLabel: string, commands: commandObjectType[], loading: boolean } = reactive({
  values: [],
  ttl: -1,
  multipleSelection: [],
  targetID: -1,
  targetLabel: '',
  commands: [],
  loading: false
})
const searchState: { search: string, isSearching: boolean, values: hashTableValueType[] } = reactive({
  search: '',
  isSearching: false,
  values: []
})
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
const inputChange = (row: hashTableValueType, isField: boolean) => {
  if (row.type === 'normal') {
    row.type = 'edit'
  } else if (row.type === 'edit' && row.field === row.oldField && row.value === row.oldValue) {
    row.type = 'normal'
  }

  if (isField) {
    const index = state.values.findIndex((item: hashTableValueType) => item.field === row.field && item.id !== row.id)
    if (index > -1) {
      row.isRepeat = true
      ElNotification({
        title: t('newKeyValue.notification.infoTitle'),
        message: `${row.field && row.field.length > 6 ? row.field.slice(0, 6) + '...' : row.field}t('newKeyValue.notification.dataDuplicationMessage')`,
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
    state.values = state.values.filter((valueItem: hashTableValueType) => valueItem.field !== item.field)
  })
}
const submit = () => {
  state.commands = []

  // command
  state.values.forEach((item: hashTableValueType) => {
    if (item.type === 'add' && item.value.trim().length) {
      state.commands.push({ command: ['HSETNX', FormatCommandField(props.keyName), FormatCommandField(item.field), FormatCommandField(item.value)] })
    } else if (item.type === 'edit' && item.field.trim().length && item.value.trim().length) {
      if (`'${item.field}'` === item.oldField) {
        state.commands.push({ command: ['HSET', FormatCommandField(props.keyName), FormatCommandField(item.field), FormatCommandField(item.value)] })
      } else {
        state.commands.push({ command: ['HDEL', FormatCommandField(props.keyName), FormatCommandField(item.field)] })
        state.commands.push({ command: ['HSETNX', FormatCommandField(props.keyName), FormatCommandField(item.field), FormatCommandField(item.value)] })
      }
    }
  })

  // ttl
  if (state.ttl > 0) {
    state.commands.push({ command: ['EXPIRE', FormatCommandField(props.keyName), String(state.ttl)] })
  }

  if (state.commands.length) {
    emit('submit', state.commands)
  } else {
    ElNotification({
      title: t('newKeyValue.notification.infoTitle'),
      message: t('newKeyValue.notification.emptyContentMessage'),
      type: 'warning',
      duration: 2000
    })
  }
}

onMounted(() => {
  addRow()
})
</script>
