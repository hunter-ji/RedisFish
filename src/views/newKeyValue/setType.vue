<template>
  <div class="list-type-container">

    <!-- tools -->
    <div class="w-full flex flex-row justify-between mb-4">
      <div class="w-1/5 flex flex-row items-center">
        <div class="text-sm mr-1">TTL(s)</div>
        <el-input-number v-model="state.ttl" size="mini" controls-position="right" :min="-1" />
      </div>
      <div class="w-1/5 flex flex-row justify-end transition-width duration-200 ease-in delay-75">
          <el-tooltip effect="light" :content="t('newKeyValue.btnGroup.add')" placement="bottom" :show-after="delayNumber">
            <el-button type="primary" size="small" circle @click="addRow" :icon="Plus" />
          </el-tooltip>
        <el-tooltip effect="light" :content="t('newKeyValue.btnGroup.delete')" placement="bottom" :show-after="delayNumber">
          <el-button type="danger" size="small" disabled :icon="Delete" circle v-if="!state.multipleSelection.length"/>
          <el-button type="danger" size="small" :icon="Delete" round class="flex flex-row items-center" @click="del" v-else>
          ({{ state.multipleSelection.length }})
        </el-button>
        </el-tooltip>
        <el-tooltip effect="light" :content="t('newKeyValue.btnGroup.submit')" placement="bottom" :show-after="delayNumber">
          <el-button type="success" size="small" :icon="Check" circle @click="submit"/>
        </el-tooltip>
      </div>
    </div>

    <!-- table -->
    <el-table
      :data="state.values"
      height="700"
      v-loading="state.loading"
      size="mini" border stripe @selection-change="handleSelectionChange"
      @cell-dblclick="edit"
      style="width: 100%;">
      <el-table-column type="selection" width="40"/>
      <el-table-column type="index" width="50"/>
      <el-table-column prop="value" label="Value">
        <template #default="scope">
          <div v-if="scope.row.id === state.targetID">
            <el-input size="mini" v-model="scope.row.value" @blur="blurInput" placeholder="null" :rows="3" type="textarea"
                      @change="inputChange(scope.row)"/>
          </div>
          <div v-else>
            <div v-if="scope.row.value.length" :style="'color:' + SwitchColorWithRepeat(scope.row.isRepeat, scope.row.type)">
              {{ contentLimit(scope.row.value) }}
            </div>
            <div class="text-gray-400 italic" v-else>null</div>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, onMounted, reactive, ref } from 'vue'
import { commandObjectType, setTableValueType } from '@/views/valueContent/index'
import { SwitchColorWithRepeat } from '@/utils/switchColor'
import { ElNotification } from 'element-plus'
import { contentLimit } from '@/utils/contentLimit'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
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
const state: { values: setTableValueType[], ttl: number, multipleSelection: setTableValueType[], targetID: number, commands: commandObjectType[], loading: boolean } = reactive({
  values: [],
  ttl: -1,
  multipleSelection: [],
  targetID: -1,
  commands: [],
  loading: false
})
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
      title: t('newKeyValue.notification.dataDuplicationTitle'),
      message: `${row.value && row.value.length > 6 ? row.value.slice(0, 6) + '...' : row.value}t('newKeyValue.notification.dataDuplicationMessage')`,
      showClose: false,
      duration: 5000
    })
  } else if (index === -1 && row.isRepeat) {
    row.isRepeat = false
  }
}
const del = () => {
  state.commands = []
  state.multipleSelection.forEach((item: setTableValueType) => {
    state.values = state.values.filter((valueItem: setTableValueType) => valueItem.value !== item.value)
  })
}
const submit = () => {
  state.commands = []

  // command
  state.values.forEach((item: setTableValueType) => {
    if (item.type === 'add' && item.value.trim().length) {
      state.commands.push({ command: ['SADD', FormatCommandField(props.keyName), FormatCommandField(item.value)] })
    } else if (item.type === 'edit' && item.value.trim().length) {
      state.commands.push({ command: ['SREM', FormatCommandField(props.keyName), FormatCommandField(item.oldValue)] })
      state.commands.push({ command: ['SADD', FormatCommandField(props.keyName), FormatCommandField(item.value)] })
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
      showClose: false,
      duration: 2000
    })
  }
}

onMounted(() => {
  addRow()
})
</script>
