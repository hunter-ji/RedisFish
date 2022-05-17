<template>
  <div class="list-type-container">

    <!-- top-tab -->
    <top-tab :key-name="props.keyName" key-type="list" class="mb-4"/>

    <!-- tools -->
    <div class="w-full flex flex-row justify-between mb-4">
      <div class="w-1/5 flex flex-row items-center">
        <div class="text-sm mr-1">TTL(s)</div>
        <el-input-number v-model="state.ttl" size="small" controls-position="right" :min="-1"/>
      </div>
      <div
        :class="searchState.search.length !== 0 ? 'w-2/4 transition-width duration-1000 ease-in-out delay-100' : 'w-1/4 transition-width duration-500 ease-in-out'">
        <el-input v-model="searchState.search" size="small" :placeholder="t('valueContent.searchInputPlaceholder')" :prefix-icon="Search" clearable
                  @keyup.enter="search"/>
      </div>
      <div class="w-64 flex flex-row items-center justify-end">
        <transition name="slide-fade">
          <div v-if="!searchState.search.length" class="w-full flex flex-row items-center justify-end mr-2">
            <el-tooltip effect="light" :content="t('valueContent.btnGroup.refresh')" placement="bottom" :show-after="delayNumber">
              <el-button type="info" size="small" :icon="RefreshRight" circle @click="refresh"/>
            </el-tooltip>
            <el-tooltip effect="light" :content="t('valueContent.btnGroup.addFromHeader')" placement="bottom" :show-after="delayNumber">
              <el-button type="primary" size="small" :icon="Top" circle @click="addRow(true)"/>
            </el-tooltip>
            <el-tooltip effect="light" :content="t('valueContent.btnGroup.addFromFooter')" placement="bottom" :show-after="delayNumber">
              <el-button type="primary" size="small" :icon="Bottom" circle @click="addRow(false)"/>
            </el-tooltip>
            <el-tooltip effect="light" :content="t('valueContent.btnGroup.deleteFromHeader')" placement="bottom" :show-after="delayNumber">
              <el-button type="danger" size="small" :icon="SortUp" circle @click="del(true)"/>
            </el-tooltip>
            <el-tooltip effect="light" :content="t('valueContent.btnGroup.deleteFromFooter')" placement="bottom" :show-after="delayNumber">
              <el-button type="danger" size="small" :icon="SortDown" circle @click="del(false)"/>
            </el-tooltip>
          </div>
        </transition>
        <el-tooltip effect="light" :content="t('valueContent.btnGroup.submit')" placement="bottom" :show-after="delayNumber">
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
        @cell-dblclick="edit"
        @cell-contextmenu="handleContentDetail"
        style="width: 100%;">
        <el-table-column type="index" width="50"/>
        <el-table-column prop="value" label="Value">
          <template #default="scope">
            <div v-if="scope.row.id === state.targetID">
              <el-input size="small" v-model="scope.row.value" @blur="blurInput" placeholder="null" :rows="3" type="textarea"
                        @change="inputChange(scope.row)"/>
            </div>
            <div v-else>
              <div v-if="scope.row.value.length"
                   :style="'color:' + SwitchColor(scope.row.type)" @click.meta.exact="copyKey(scope.row.value, t('valueContent.notification.copySuccessMessage'))">
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
import { defineEmits, defineProps, PropType, reactive, watch, ref } from 'vue'
import { commandObjectType, listTableValueType } from '@/views/valueContent/index'
import TopTab from './topTab.vue'
import { SwitchColor } from '@/utils/switchColor'
import { ElNotification } from 'element-plus'
import { contentLimit } from '@/utils/contentLimit'
import { Check, RefreshRight, Search, Top, Bottom, SortUp, SortDown } from '@element-plus/icons-vue'
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
const state: { values: listTableValueType[], ttl: number, oldTTL: number, targetID: number, commands: commandObjectType[], loading: boolean } = reactive({
  values: [],
  ttl: 0,
  oldTTL: 0,
  targetID: 0,
  commands: [],
  loading: true
})
const searchState: { search: string, isSearching: boolean, values: listTableValueType[] } = reactive({
  search: '',
  isSearching: false,
  values: []
})
const contentDetailState: { isShow: boolean, message: string, row: listTableValueType } = reactive({
  isShow: false,
  message: '',
  row: {
    id: 0,
    value: '',
    oldValue: '',
    type: '',
    isFront: false
  }
})
const refresh = () => {
  state.loading = true
  state.values = []
  emit('refresh', true)
}
const edit = (e: listTableValueType) => {
  state.targetID = e.id
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
const del = (isFront: boolean) => {
  state.commands = []
  if (isFront) {
    state.commands.push({ command: ['LPOP', FormatCommandField(props.keyName)] })
  } else {
    state.commands.push({ command: ['RPOP', FormatCommandField(props.keyName)] })
  }
  emit('delete', state.commands)
}
const submit = () => {
  state.commands = []

  // ttl
  if (state.ttl !== 0 && state.ttl !== state.oldTTL) {
    state.commands.push({ command: ['EXPIRE', FormatCommandField(props.keyName), String(state.ttl)] })
  }

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
const handleContentDetail = (row: listTableValueType, column: { label: string }) => {
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
    isFront: false
  }
}
const handleDetailUpdate = (message: string) => {
  contentDetailState.row.value = message
  inputChange(contentDetailState.row)
  handleDetailCancel()
}

watch(() => searchState.search, () => {
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
      isFront: false
    })
  })
  state.loading = false
})
</script>
