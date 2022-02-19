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
    <el-dialog v-model="dialog.show" @closed="handleFinishEvent()" title="执行命令" width="50%" center>
      <el-table
        :data="state.commands"
        height="600"
        size="mini" border stripe
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
        <el-button @click="dialog.show = false" v-if="state.runStatus <= 0">取消</el-button>
        <el-button type="primary" v-if="state.runStatus === 0" @click="runCommand()">执行</el-button>
        <el-button type="primary" v-if="state.runStatus === 1" disabled>执行中</el-button>
        <el-button type="primary" v-if="state.runStatus === 2" @click="handleFinishEvent()">确定</el-button>
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
  client.on('error', (err: string) => {
    console.log('Redis Client Error', err)
  })

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
    state.values.push('未知类型')
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
  for (let i = 0; i < state.commands.length; i++) {
    state.commands[i].result = await client.sendCommand(state.commands[i].command)
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

<style>
.el-button {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
