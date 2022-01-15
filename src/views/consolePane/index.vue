<template>
  <div class="p-2">
    <div class="flex flex-row items-center justify-end mb-4">
      <el-tooltip effect="light" content="提交操作" placement="bottom" :show-after="500">
        <el-button type="success" size="small" :icon="Check" circle @click="submit"/>
      </el-tooltip>
    </div>
    <div id="ace"/>
  </div>
</template>

<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Check } from '@element-plus/icons-vue'
import { defineEmits, onMounted, reactive } from 'vue'
import ace from 'ace-builds'
import 'ace-builds/webpack-resolver'
import 'ace-builds/src-noconflict/theme-monokai'
import { ElNotification } from 'element-plus'

const emit = defineEmits(['submit'])
const state: { aceEditor: any, themePath: string } = reactive({
  aceEditor: null,
  themePath: 'ace/theme/monokai'
})
const getSelectedCommandsArr = (): string[] => {
  const selectedText = state.aceEditor.getSelectedText()
  return selectedText.split('\n').filter((item: string) => item && item.length)
}
const submit = () => {
  const commandsArr = getSelectedCommandsArr()
  if (commandsArr.length) {
    emit('submit', commandsArr)
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
  state.aceEditor = ace.edit('ace', {
    maxLines: 20, // 最大行数，超过会自动出现滚动条
    minLines: 20, // 最小行数，还未到最大行数时，编辑器会自动伸缩大小
    fontSize: 14, // 编辑器内字体大小
    theme: state.themePath, // 默认设置的主题
    // mode: state.modePath, // 默认设置的语言模式
    tabSize: 4 // 制表符设置为 4 个空格大小
  })
})
</script>
