<template>
  <div class="list-type-container">
    <div class="w-full flex flex-row justify-between mb-4">
      <div class="w-1/5 flex flex-row items-center">
        <div class="text-sm mr-1">TTL(s)</div>
        <el-input-number v-model="state.ttl" size="mini" controls-position="right" :min="-1"/>
      </div>
      <div class="w-64 flex flex-row items-center justify-end">
        <div class="mr-2 flex flex-row items-center">
          <el-tooltip effect="light" content="头部添加" placement="bottom" :show-after="delayNumber">
            <img src="@/assets/add_up.png" height="34" width="34" alt="add_up"
                 class="hover:opacity-70 cursor-pointer ml-2" @click="addRow(true)"/>
          </el-tooltip>
          <el-tooltip effect="light" content="尾部添加" placement="bottom" :show-after="delayNumber">
            <img src="@/assets/add_down.png" height="34" width="34" alt="add_down"
                 class="hover:opacity-70 cursor-pointer ml-2" @click="addRow(false)"/>
          </el-tooltip>
          <el-tooltip effect="light" content="头部移出" placement="bottom" :show-after="delayNumber">
            <img src="@/assets/del_up.png" height="34" width="34" alt="del_up"
                 class="hover:opacity-70 cursor-pointer ml-2" @click="del(true)"/>
          </el-tooltip>
          <el-tooltip effect="light" content="尾部移出" placement="bottom" :show-after="delayNumber">
            <img src="@/assets/del_down.png" height="34" width="34" alt="del_down"
                 class="hover:opacity-70 cursor-pointer ml-2" @click="del(false)"/>
          </el-tooltip>
        </div>
        <el-tooltip effect="light" content="提交操作" placement="bottom" :show-after="delayNumber">
          <el-button type="success" size="small" :icon="Check" circle @click="submit" class="ml-2"/>
        </el-tooltip>
      </div>
    </div>
    <el-table
      :data="searchState.isSearching ? searchState.values : state.values"
      v-loading="state.loading"
      height="700"
      size="mini" border stripe
      @cell-dblclick="edit"
      style="width: 100%;">
      <el-table-column type="index" width="50"/>
      <el-table-column prop="value" label="Value">
        <template #default="scope">
          <div v-if="scope.row.id === state.targetID">
            <el-input size="mini" v-model="scope.row.value" @blur="blurInput" placeholder="null" :rows="3"
                      type="textarea"
                      @change="inputChange(scope.row)"/>
          </div>
          <div v-else>
            <div v-if="scope.row.value.length"
                 :style="'color:' + SwitchColor(scope.row.type)">
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
import { commandObjectType, listTableValueType } from '@/views/valueContent/index'
import { SwitchColor } from '@/utils/switchColor'
import { ElNotification } from 'element-plus'
import { contentLimit } from '@/utils/contentLimit'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Check } from '@element-plus/icons-vue'

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
        state.commands.push({ command: ['LPUSH', props.keyName, item.value] })
      } else {
        state.commands.push({ command: ['RPUSH', props.keyName, item.value] })
      }
    } else if (item.type === 'edit' && item.value.trim().length) {
      state.commands.push({ command: ['LSET', props.keyName, String(item.id - 1), item.value] })
    }
  })

  // ttl
  if (state.ttl > 0) {
    state.commands.push({ command: ['EXPIRE', props.keyName, String(state.ttl)] })
  }

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

onMounted(() => {
  addRow(true)
})
</script>
