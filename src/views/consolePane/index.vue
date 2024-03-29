<template>
  <div class="p-2">

    <!-- top tools -->
    <div class="flex flex-row items-center justify-between mb-4 px-4">
      <!-- mode switch -->
      <el-select v-model="consoleMode" placeholder="Select" size="small">
        <el-option
          v-for="item in consoleModeSelectOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>

      <!-- btn group -->
      <div v-show="consoleMode !== 'command'">
        <el-tooltip effect="light" :content="t('consolePane.index.checkBtn')" placement="bottom" :show-after="500">
          <el-button type="success" size="small" :icon="Check" circle @click="submit"/>
        </el-tooltip>
      </div>
    </div>

    <!-- command mode -->
    <div v-show="consoleMode === 'command'">
      <command-mode :server-tab="props.serverTab" />
    </div>

    <!-- console mode -->
    <div v-show="consoleMode === 'console query'" class="px-4">
      <!-- console -->
      <div :id="`ace${aceID}`" />

      <!-- output -->
      <el-tabs
        v-model="outputState.activeTab"
        type="card"
        @tab-remove="removeTab"
        class="mt-4"
      >
        <el-tab-pane :label="t('consolePane.index.historyLabel')" name="History" :closable="outputState.historyClosable">
          <history-pane :res="clientState.historyCommands"/>
        </el-tab-pane>
        <el-tab-pane
          v-for="(item, index) in outputState.outputTabs"
          :key="index"
          :label="`${t('consolePane.index.historyPaneLabel')}${index+1}`"
          :name="`result${index+1}`"
          :closable="outputState.outputClosable"
        >
          <result-pane :content="item"/>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- dialog -->
    <el-dialog v-model="dialog.show" :title="t('consolePane.index.dialog.title')" width="50%" center>
      <div class="mb-2">{{ t('consolePane.index.dialog.content') }}</div>
      <el-table
        :data="clientState.showCommands"
        height="600"
        size="small" border stripe
        style="width: 100%;">
        <el-table-column label="commands" prop="label"/>
      </el-table>
      <template #footer>
      <span class="flex flex-row items-center justify-end">
        <el-button @click="dialog.show = false">{{ t('consolePane.index.dialog.cancelBtn') }}</el-button>
        <el-button type="primary" @click="runCommands">{{ t('consolePane.index.dialog.runBtn') }}</el-button>
      </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Check } from '@element-plus/icons-vue'
import { defineProps, onMounted, PropType, reactive, ref, Ref } from 'vue'
import ace from 'ace-builds'
import 'ace-builds/webpack-resolver'
import { ElNotification } from 'element-plus'
import { serverTabType } from '@/store/modules/serverList'
import { getClientWithDB } from '@/utils/redis'
import { historyCommandType, outputPaneType } from '@/views/consolePane/index'
import { dateFormat } from '@/utils/formatTime'
import HistoryPane from './history.vue'
import ResultPane from './result.vue'
import { useI18n } from 'vue-i18n'
import CommandMode from './commandMode.vue'
import { setLog } from '@/utils/log'
import { handleCommandFormat } from '@/utils/cutsomCommandFormat'

const { t } = useI18n()

const props = defineProps({
  serverTab: {
    type: Object as PropType<serverTabType>,
    required: true
  }
})

const consoleMode = ref('command')
const consoleModeSelectOptions: { label: string, value: string }[] = [
  {
    label: 'command',
    value: 'command'
  },
  {
    label: 'console query',
    value: 'console query'
  }
]

const state: { aceEditor: any, themePath: string } = reactive({
  aceEditor: null,
  themePath: 'ace/theme/gruvbox'
})
const clientState: { keyType: string, values: string[], ttl: number, commands: string[], showCommands: { label: string }[], historyCommands: historyCommandType[] } = reactive({
  keyType: '',
  values: [],
  ttl: 0,
  commands: [],
  showCommands: [],
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
      title: t('consolePane.index.notification.title'),
      message: t('consolePane.index.notification.message'),
      type: 'warning',
      duration: 2000
    })
  }
}
const dialog = reactive({
  show: false
})
const client = getClientWithDB(props.serverTab)
const handleCommand = async (commands: string[]) => {
  clientState.commands = []
  clientState.commands = commands
  clientState.showCommands = []
  commands.forEach((item: string) => {
    clientState.showCommands.push({ label: item })
  })
  dialog.show = true
}
const runCommands = async () => {
  dialog.show = false
  await client.connect()
  outputState.outputTabs = []

  for (const item of clientState.commands) {
    const commandArr = await handleCommandFormat(item)
    const res = await client.sendCommand(commandArr)
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
    const createAt = dateFormat()
    clientState.historyCommands.unshift({
      command: item,
      result: result,
      resultData: resultData,
      createdAt: createAt
    })

    await setLog(props.serverTab, commandArr, createAt)
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
const aceID: Ref<string> = ref('')
const genRandomAceID = async () => {
  aceID.value = String(new Date().getUTCMilliseconds())
}

onMounted(async () => {
  await genRandomAceID()
  state.aceEditor = ace.edit(`ace${aceID.value}`, {
    maxLines: 15,
    minLines: 15,
    fontSize: 14,
    theme: state.themePath,
    tabSize: 4,
    showPrintMargin: false
  })
})
</script>

<style scoped>
html.dark .commands-dialog {
  background-color: #0a0a0a;
}
</style>
