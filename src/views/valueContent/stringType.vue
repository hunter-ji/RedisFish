<template>
  <div>
    <top-tab :key-name="props.keyName" key-type="string" class="mb-4"/>
    <div class="w-full flex flex-row justify-between mb-4">
      <div class="w-1/5 flex flex-row items-center">
        <div class="text-sm mr-1">TTL(s)</div>
        <el-input-number v-model="state.ttl" size="mini" controls-position="right" :min="-1"/>
      </div>
      <div class="flex flex-row items-center justify-end">
        <el-tooltip effect="light" content="刷新" placement="bottom" :show-after="delayNumber">
          <el-button type="info" size="small" :icon="RefreshRight" circle @click="refresh"/>
        </el-tooltip>
        <el-tooltip effect="light" content="JSON格式化" placement="bottom" :show-after="delayNumber">
          <el-button type="warning" size="small" :icon="Brush" circle @click="stringFormat"/>
        </el-tooltip>
        <el-tooltip effect="light" content="提交操作" placement="bottom" :show-after="delayNumber">
          <el-button type="success" size="small" :icon="Check" circle @click="submit"/>
        </el-tooltip>
      </div>
    </div>
    <el-input v-model="state.val" :rows="20" type="textarea"/>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, PropType, reactive, ref, watch } from 'vue'
import TopTab from './topTab.vue'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Check, RefreshRight, Brush } from '@element-plus/icons-vue'
import { commandObjectType } from '@/views/valueContent/index'
import { ElNotification } from 'element-plus'
import { FormatCommandField } from '@/utils/formatCommandField'

const emit = defineEmits(['refresh', 'delete', 'submit'])
const delayNumber = ref(500)
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
const state: { val: string, oldVal: string, ttl: number, oldTTL: number, commands: commandObjectType[] } = reactive({
  val: '',
  oldVal: '',
  ttl: 0,
  oldTTL: 0,
  commands: []
})
const refresh = () => {
  emit('refresh', true)
}
const stringFormat = () => {
  try {
    const jsonData = JSON.parse(state.val)
    state.val = JSON.stringify(jsonData, null, '\t')
  } catch (error) {
    console.log('json格式化错误')
  }
}
const submit = () => {
  state.commands = []

  // ttl
  if (state.ttl !== 0 && state.ttl !== state.oldTTL) {
    state.commands.push({ command: ['EXPIRE', FormatCommandField(props.keyName), String(state.ttl)] })
  }

  // command
  if (state.val !== state.oldVal) {
    state.commands.push({ command: ['SET', FormatCommandField(props.keyName), FormatCommandField(String(state.val))] })
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

watch(props, () => {
  state.ttl = props.ttl
  state.oldTTL = props.ttl
  state.val = props.values[0]
  state.oldVal = props.values[0]
})
</script>
