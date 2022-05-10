<template>
  <div class="value-content-container py-2 px-6">
    <string-type :key-name="props.targetKey" :values="state.values" :ttl="state.ttl" @refresh="fetchData"
                 @submit="handleCommand"
                 v-if="state.keyType === 'string'"/>
    <hash-type :key-name="props.targetKey" :values="state.values" :ttl="state.ttl" @refresh="fetchData"
               @delete="handleCommand"
               @submit="handleCommand" v-else-if="state.keyType === 'hash'"/>
    <list-type :key-name="props.targetKey" :values="state.values" :ttl="state.ttl" @refresh="fetchData"
               @delete="handleCommand"
               @submit="handleCommand" v-else-if="state.keyType === 'list'"/>
    <set-type :key-name="props.targetKey" :values="state.values" :ttl="state.ttl" @refresh="fetchData"
              @delete="handleCommand"
              @submit="handleCommand" v-else-if="state.keyType === 'set'"/>
    <z-set-type :key-name="props.targetKey" :values="state.values" :ttl="state.ttl" @refresh="fetchData"
                @delete="handleCommand"
                @submit="handleCommand" v-else-if="state.keyType === 'zset'"/>

    <!-- run commands dialog -->
    <el-dialog v-model="dialog.show" @closed="handleFinishEvent()" :title="t('valueContent.index.runDialog.title')" width="50%" center>
      <el-table
        :data="state.commands"
        height="600"
        size="small" border stripe
        style="width: 100%;">
        <el-table-column label="commands">
          <template #default="scope">
            <div class="flex flex-row justify-start items-center">
              <div v-for="(item, index) in scope.row.command" :key="index" class="pr-1">{{ item.includes(' ') ? `'${item}'` : item }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="result" prop="result" v-if="state.runStatus > 0" width="100"/>
      </el-table>
      <template #footer>
      <span class="flex flex-row items-center justify-end">
        <el-button @click="dialog.show = false" v-if="state.runStatus <= 0">{{ t('valueContent.index.runDialog.cancel') }}</el-button>
        <el-button type="primary" v-if="state.runStatus === 0" @click="runCommand()">{{ t('valueContent.index.runDialog.run') }}</el-button>
        <el-button type="primary" v-if="state.runStatus === 1" disabled>{{ t('valueContent.index.runDialog.running') }}</el-button>
        <el-button type="primary" v-if="state.runStatus === 2" @click="handleFinishEvent()">{{ t('valueContent.index.runDialog.submit') }}</el-button>
      </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, PropType, reactive } from 'vue'
import { serverTabType } from '@/store/modules/serverList'
import { getClient } from '@/utils/redis'
import StringType from './stringType.vue'
import HashType from './hashType.vue'
import ListType from './listType.vue'
import SetType from './setType.vue'
import ZSetType from './zsetType.vue'
import { commandObjectType } from '@/views/valueContent/index'
import { FormatCommandField } from '@/utils/formatCommandField'
import { useI18n } from 'vue-i18n'
import { setLog } from '@/utils/log'
import { dateFormat } from '@/utils/formatTime'

const { t } = useI18n()

const props = defineProps({
  serverTab: {
    type: Object as PropType<serverTabType>,
    required: true
  },
  targetKey: {
    type: String,
    required: true
  }
})

const state: { keyType: string, values: string[], ttl: number, commands: commandObjectType[], runStatus: number } = reactive({
  keyType: '',
  values: [],
  ttl: 0,
  commands: [],
  runStatus: 0 // 0: before run, 1: running, 2: after running
})
const dialog = reactive({
  show: false
})
const client = getClient(props.serverTab)
const fetchData = async () => {
  state.values = []
  await client.connect()

  await client.sendCommand(['select', props.serverTab.db.slice(-1)])
  state.keyType = await client.sendCommand(['type', props.targetKey])

  if (state.keyType === 'string') {
    const redisValue: string = await client.sendCommand(['get', FormatCommandField(props.targetKey)])
    state.values.push(redisValue)
  } else if (state.keyType === 'hash') {
    state.values = await client.sendCommand(['hgetall', FormatCommandField(props.targetKey)])
  } else if (state.keyType === 'list') {
    state.values = await client.sendCommand(['lrange', FormatCommandField(props.targetKey), '0', '-1'])
  } else if (state.keyType === 'set') {
    state.values = await client.sendCommand(['smembers', FormatCommandField(props.targetKey)])
  } else if (state.keyType === 'zset') {
    state.values = await client.sendCommand(['zrange', FormatCommandField(props.targetKey), '0', '-1', 'withscores'])
  } else {
    state.values.push(t('valueContent.index.unknownTypeValue'))
  }

  state.ttl = await client.ttl(props.targetKey)

  await client.disconnect()
}
const handleCommand = async (commands: commandObjectType[]) => {
  state.commands = []
  state.commands = commands
  dialog.show = true
}
const runCommand = async () => {
  state.runStatus = 1
  await client.connect()
  await client.sendCommand(['select', props.serverTab.db.slice(-1)])
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
    await fetchData()
    state.commands = []
    state.runStatus = 0
  }
}

onMounted(() => {
  fetchData()
})
</script>
