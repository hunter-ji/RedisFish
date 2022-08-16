<template>
  <div class="list-type-container">

    <!-- tools -->
    <div class="w-full flex flex-row justify-between mb-4">
      <div class="w-1/5 flex flex-row items-center">
        <div class="text-sm mr-1">TTL(s)</div>
        <el-input-number v-model="state.ttl" size="small" controls-position="right" :min="-1"/>
      </div>
      <div class="w-64 flex flex-row items-center justify-end">
        <div class="mr-2 flex flex-row items-center">
          <el-tooltip effect="light" :content="t('newKeyValue.btnGroup.addFromHeader')" placement="bottom" :show-after="delayNumber">
            <el-button type="primary" size="small" :icon="Top" circle @click="addRow(true)"/>
          </el-tooltip>
          <el-tooltip effect="light" :content="t('newKeyValue.btnGroup.addFromFooter')" placement="bottom" :show-after="delayNumber">
            <el-button type="primary" size="small" :icon="Bottom" circle @click="addRow(false)"/>
          </el-tooltip>
          <el-tooltip effect="light" :content="t('newKeyValue.btnGroup.deleteFromHeader')" placement="bottom" :show-after="delayNumber">
            <el-button type="danger" size="small" :icon="SortUp" circle @click="del(true)"/>
          </el-tooltip>
          <el-tooltip effect="light" :content="t('newKeyValue.btnGroup.deleteFromFooter')" placement="bottom" :show-after="delayNumber">
            <el-button type="danger" size="small" :icon="SortDown" circle @click="del(false)"/>
          </el-tooltip>
        </div>
        <el-tooltip effect="light" :content="t('newKeyValue.btnGroup.submit')" placement="bottom" :show-after="delayNumber">
          <el-button type="success" size="small" :icon="Check" circle @click="submit" class="ml-2"/>
        </el-tooltip>
      </div>
    </div>

    <!-- table -->
    <div class="table-container">
      <el-table
        :data="searchState.isSearching ? searchState.values : state.values"
        v-loading="state.loading"
        size="small" border stripe
        style="width: 100%;">
        <el-table-column type="index" width="50"/>
        <el-table-column prop="value" label="Value">
          <template #default="scope">
            <div v-if="scope.row.id === state.targetID">
              <el-input size="small" v-model="scope.row.value" @blur="blurInput" placeholder="null" :rows="3"
                        type="textarea"
                        :id="`list-row-input-${scope.row.id}`"
                        @change="inputChange(scope.row)"/>
            </div>
            <div v-else>
              <div v-if="scope.row.value.length"
                   :style="'color:' + SwitchColor(scope.row.type)"
                   @dblclick.left.exact="handleRowEdit(scope.row.id)"
              >
                {{ contentLimit(scope.row.value) }}
              </div>
              <div class="text-gray-400 italic" v-else @dblclick.left.exact="handleRowEdit(scope.row.id)">null</div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, onMounted, reactive, ref } from 'vue'
import { commandObjectType, listTableValueType } from '@/views/valueContent/index'
import { SwitchColor } from '@/utils/switchColor'
import { ElNotification } from 'element-plus'
import { contentLimit } from '@/utils/contentLimit'
import { Check, Top, Bottom, SortUp, SortDown } from '@element-plus/icons-vue'
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
const state: { values: listTableValueType[], ttl: number, targetID: number, commands: commandObjectType[], loading: boolean } = reactive({
  values: [],
  ttl: -1,
  targetID: 0,
  commands: [],
  loading: false
})
const searchState: { search: string, isSearching: boolean, values: listTableValueType[] } = reactive({
  search: '',
  isSearching: false,
  values: []
})
const handleRowEdit = (id: number) => {
  state.targetID = id
  setTimeout(() => {
    const dom = document.getElementById(`list-row-input-${id}`)
    if (dom) {
      dom.focus()
    }
  }, 100)
}
const blurInput = () => {
  state.targetID = 0
}
const addRow = (isFront: boolean) => {
  if (isFront) {
    state.values.unshift({
      id: state.values.length + 1,
      value: '',
      oldValue: '',
      type: 'add',
      isFront: isFront
    })
  } else {
    state.values.push({
      id: state.values.length + 1,
      value: '',
      oldValue: '',
      type: 'add',
      isFront: isFront
    })
  }
}
const inputChange = (row: listTableValueType) => {
  if (row.type === 'normal') {
    row.type = 'edit'
  } else if (row.type === 'edit' && row.value === row.oldValue) {
    row.type = 'normal'
  }
}
const del = (isFront: boolean) => {
  state.commands = []
  if (isFront) {
    state.values.shift()
  } else {
    state.values.pop()
  }
}
const submit = () => {
  state.commands = []

  // command
  state.values.forEach((item: listTableValueType) => {
    if (item.type === 'add' && item.value.trim().length) {
      if (item.isFront) {
        state.commands.push({ command: ['LPUSH', FormatCommandField(props.keyName), FormatCommandField(item.value)] })
      } else {
        state.commands.push({ command: ['RPUSH', FormatCommandField(props.keyName), FormatCommandField(item.value)] })
      }
    } else if (item.type === 'edit' && item.value.trim().length) {
      state.commands.push({ command: ['LSET', FormatCommandField(props.keyName), String(item.id - 1), FormatCommandField(item.value)] })
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
  addRow(true)
})
</script>
