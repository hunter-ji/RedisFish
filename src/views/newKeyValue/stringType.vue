<template>
  <div>
    <div class="w-full flex flex-row justify-between mb-4">
      <div class="w-1/5 flex flex-row items-center">
        <div class="text-sm mr-1">TTL(s)</div>
        <el-input-number v-model="state.ttl" size="mini" controls-position="right" :min="-1"/>
      </div>
      <div class="flex flex-row items-center justify-end">
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
import { defineEmits, defineProps, reactive, ref } from 'vue'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Check, Brush } from '@element-plus/icons-vue'
import { commandObjectType } from '@/views/valueContent/index'
import { ElNotification } from 'element-plus'

const emit = defineEmits(['delete', 'submit'])
const delayNumber = ref(500)
const props = defineProps({
  keyName: {
    type: String,
    required: true
  }
})
const state: { val: string, ttl: number, commands: commandObjectType[] } = reactive({
  val: '',
  ttl: -1,
  commands: []
})
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

  // command
  if (String(state.val).length) {
    state.commands.push({ command: ['SET', `'${props.keyName}'`, `'${String(state.val)}'`] })
  }

  // ttl
  if (state.ttl > 0) {
    state.commands.push({ command: ['EXPIRE', `'${props.keyName}'`, String(state.ttl)] })
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
</script>
