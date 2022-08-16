<template>
  <div class="value-content-container py-2 px-6">

    <!-- base info form -->
    <div class="container py-2 w-full flex flex-row rounded">
      <el-input type="text" size="small" v-model="keyState.keyName" placeholder="Key" clearable>
        <template #prepend>
          <el-select v-model="keyState.keyType" placeholder="Select" size="small" style="width: 100px;">
            <el-option
              v-for="item in selectOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </template>
      </el-input>
    </div>

    <!-- value content -->
    <string-type :key-name="keyState.keyName" @submit="handleCommand" v-if="keyState.keyType === 'string'"/>
    <hash-type :key-name="keyState.keyName" @submit="handleCommand" v-else-if="keyState.keyType === 'hash'"/>
    <list-type :key-name="keyState.keyName" @submit="handleCommand" v-else-if="keyState.keyType === 'list'"/>
    <set-type :key-name="keyState.keyName" @submit="handleCommand" v-else-if="keyState.keyType === 'set'"/>
    <z-set-type :key-name="keyState.keyName" @submit="handleCommand" v-else-if="keyState.keyType === 'zset'"/>

    <!-- run commands dialog -->
    <el-dialog v-model="dialog.show" @closed="handleFinishEvent()" :title="t('newKeyValue.index.runDialog.title')" width="50%" center>
      <el-table
        :data="state.commands"
        height="600"
        size="small" border stripe
        style="width: 100%;">
        <el-table-column label="commands">
          <template #default="scope">
            {{ scope.row.command.join(' ') }}
          </template>
        </el-table-column>
        <el-table-column label="result" prop="result" v-if="state.runStatus > 0"/>
      </el-table>
      <template #footer>
      <span class="flex flex-row items-center justify-end">
        <el-button @click="dialog.show = false" v-if="state.runStatus <= 0">{{ t('newKeyValue.index.runDialog.cancel') }}</el-button>
        <el-button type="primary" v-if="state.runStatus === 0" @click="runCommand()">{{ t('newKeyValue.index.runDialog.run') }}</el-button>
        <el-button type="primary" v-if="state.runStatus === 1" disabled>{{ t('newKeyValue.index.runDialog.running') }}</el-button>
        <el-button type="primary" v-if="state.runStatus === 2" @click="handleFinishEvent()">{{ t('newKeyValue.index.runDialog.submit') }}</el-button>
      </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, PropType, reactive } from 'vue'
import { serverTabType } from '@/store/modules/serverList'
import { getClientWithDB } from '@/utils/redis'
import StringType from './stringType.vue'
import HashType from './hashType.vue'
import ListType from './listType.vue'
import SetType from './setType.vue'
import ZSetType from './zsetType.vue'
import { commandObjectType } from '@/views/valueContent/index'
import { ElNotification } from 'element-plus/es'
import { selectOptions } from '.'
import { useI18n } from 'vue-i18n'
import { setLog } from '@/utils/log'
import { dateFormat } from '@/utils/formatTime'

const { t } = useI18n()

const emit = defineEmits(['clearNewTab'])
const props = defineProps({
  serverTab: {
    type: Object as PropType<serverTabType>,
    required: true
  }
})

const state: { commands: commandObjectType[], runStatus: number } = reactive({
  commands: [],
  runStatus: 0 // 0: before run, 1: running, 2: after running
})
const dialog = reactive({
  show: false
})
const keyState: { keyType: string, keyName: string } = reactive({
  keyType: 'string',
  keyName: ''
})

const client = getClientWithDB(props.serverTab)

const handleCommand = (commands: commandObjectType[]) => {
  if (!keyState.keyName.length) {
    ElNotification({
      title: t('newKeyValue.index.notification.title'),
      message: t('newKeyValue.index.notification.message'),
      type: 'warning',
      duration: 2000
    })
    return
  }
  state.commands = []
  state.commands = commands
  dialog.show = true
}
const runCommand = async () => {
  state.runStatus = 1
  await client.connect()
  for (let i = 0; i < state.commands.length; i++) {
    const command = state.commands[i].command
    state.commands[i].result = await client.sendCommand(command)
    await setLog(props.serverTab, command, dateFormat())
  }
  await client.disconnect()
  state.runStatus = 2
}
const handleFinishEvent = async () => {
  dialog.show = false
  if (state.runStatus === 2) {
    state.commands = []
    state.runStatus = 0
    emit('clearNewTab', keyState.keyName)
  }
}
</script>
