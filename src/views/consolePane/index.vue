<template>
  <div class="p-2">
    <!-- btn group -->
    <div class="flex flex-row items-center justify-end mb-4">
      <el-tooltip effect="light" content="提交操作" placement="bottom" :show-after="500">
        <el-button type="success" size="small" :icon="Check" circle @click="submit"/>
      </el-tooltip>
    </div>

    <!-- console -->
    <div id="ace"/>

    <!-- output -->
    <el-tabs
      v-model="outputState.activeTab"
      type="card"
      @tab-remove="removeTab"
      class="mt-4"
    >
      <el-tab-pane label="执行历史" name="History" :closable="outputState.historyClosable">
        <history-pane :res="clientState.historyCommands"/>
      </el-tab-pane>
      <el-tab-pane
        v-for="(item, index) in outputState.outputTabs"
        :key="index"
        :label="`执行结果${index+1}`"
        :name="`result${index+1}`"
        :closable="outputState.outputClosable"
      >
        <result-pane :content="item"/>
      </el-tab-pane>
    </el-tabs>

    <!-- dialog -->
    <el-dialog v-model="dialog.show" title="提示" width="50%" center>
      <div>将要执行如下命令：</div>
      <div class="h-80 overflow-y-auto flex flex-col justify-start p-2 bg-gray-300 mt-2">
        <div class="p-2" v-for="(item, index) in clientState.commands" :key="index">{{ item }}</div>
      </div>
      <template #footer>
      <span class="flex flex-row items-center justify-end">
        <el-button @click="dialog.show = false">取消</el-button>
        <el-button type="primary" @click="runCommands">执行</el-button>
      </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Check } from '@element-plus/icons-vue'
import { defineProps, onMounted, PropType, reactive } from 'vue'
import ace from 'ace-builds'
import 'ace-builds/webpack-resolver'
import 'ace-builds/src-noconflict/theme-monokai'
import { ElNotification } from 'element-plus'
import { serverTabType } from '@/store/modules/serverList'
import { getClient } from '@/utils/redis'
import { historyCommandType, outputPaneType } from '@/views/consolePane/index'
import { dateFormat } from '@/utils/formatTime'
import HistoryPane from './history.vue'
import ResultPane from './result.vue'

const props = defineProps({
  serverTab: {
    type: Object as PropType<serverTabType>,
    required: true
  }
})

const state: { aceEditor: any, themePath: string } = reactive({
  aceEditor: null,
  themePath: 'ace/theme/monokai'
})
const clientState: { keyType: string, values: string[], ttl: number, commands: string[], historyCommands: historyCommandType[] } = reactive({
  keyType: '',
  values: [],
  ttl: 0,
  commands: [],
  historyCommands: []
})
const outputState: { activeTab: string, historyClosable: boolean, outputClosable: boolean, outputTabs: outputPaneType[] } = reactive({
  activeTab: 'History',
  historyClosable: false,
  outputClosable: true,
  outputTabs: []
})
const getSelectedCommandsArr = (): string[] => {
  const selectedText = state.aceEditor.getSelectedText()
  return selectedText.trim().split('\n').filter((item: string) => item && item.length)
}
const submit = () => {
  const commandsArr = getSelectedCommandsArr()
  if (commandsArr.length) {
    handleCommand(commandsArr)
  } else {
    ElNotification({
      title: '提示',
      message: '没有可执行的操作',
      showClose: false,
      duration: 2000
    })
  }
}
const dialog = reactive({
  show: false
})
const client = getClient(props.serverTab)
const fetchData = async () => {
  await client.connect()
  await client.sendCommand(['select', props.serverTab.db.slice(-1)])
  await client.disconnect()
}
const handleCommand = async (commands: string[]) => {
  clientState.commands = []
  clientState.commands = commands
  dialog.show = true
}
const runCommands = async () => {
  dialog.show = false
  await client.connect()
  outputState.outputTabs = []

  for (const item of clientState.commands) {
    const res = await client.sendCommand(item.split(' '))
    let result = res
    let resultData = ''
    if (res && res.length > 1 && res !== 'OK') {
      result = 'Success'
      resultData = res
      // 新增执行tab
      outputState.outputTabs.push({
        command: item,
        result: res
      })
    } else if (!res) {
      result = 'null'
      resultData = ''
    } else {
      result = `${res}`
      resultData = ''
    }
    clientState.historyCommands.unshift({
      command: item,
      result: result,
      resultData: resultData,
      createdAt: dateFormat()
    })
  }

  if (outputState.outputTabs.length) {
    outputState.activeTab = `result${outputState.outputTabs.length}`
  }

  await client.disconnect()
}
const removeTab = (targetTabName: string) => {
  outputState.outputTabs = outputState.outputTabs.filter((item: outputPaneType, index: number) => `result${index + 1}` !== targetTabName)
  if (outputState.outputTabs.length) {
    outputState.activeTab = `result${outputState.outputTabs.length}`
  } else {
    outputState.activeTab = 'History'
  }
}

onMounted(async () => {
  await fetchData()
  state.aceEditor = ace.edit('ace', {
    maxLines: 15, // 最大行数，超过会自动出现滚动条
    minLines: 15, // 最小行数，还未到最大行数时，编辑器会自动伸缩大小
    fontSize: 14, // 编辑器内字体大小
    theme: state.themePath, // 默认设置的主题
    // mode: state.modePath, // 默认设置的语言模式
    tabSize: 4 // 制表符设置为 4 个空格大小
  })
})
</script>
