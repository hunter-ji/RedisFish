<template>
  <div class="value-content-container py-2 px-6">
    <string-type :key-name="props.targetKey" :values="state.values" :ttl="state.ttl" @refresh="fetchData" @submit="handleCommand"
                 v-if="state.keyType === 'string'"/>
    <hash-type :key-name="props.targetKey" :values="state.values" :ttl="state.ttl" @refresh="fetchData" @delete="handleCommand"
               @submit="handleCommand" v-else-if="state.keyType === 'hash'"/>
    <list-type :key-name="props.targetKey" :values="state.values" :ttl="state.ttl" @refresh="fetchData" @delete="handleCommand"
               @submit="handleCommand" v-else-if="state.keyType === 'list'"/>
    <set-type :key-name="props.targetKey" :values="state.values" :ttl="state.ttl" @refresh="fetchData" @delete="handleCommand"
              @submit="handleCommand" v-else-if="state.keyType === 'set'"/>
    <z-set-type :key-name="props.targetKey" :values="state.values" :ttl="state.ttl" @refresh="fetchData" @delete="handleCommand"
                @submit="handleCommand" v-else-if="state.keyType === 'zset'"/>

    <el-dialog v-model="dialog.show" title="提示" width="50%" center>
      <div>将要执行如下命令：</div>
      <div class="h-80 overflow-y-auto flex flex-col justify-start p-2 bg-gray-300 mt-2">
        <div class="p-2" v-for="(item, index) in state.commands" :key="index">{{ item.command.join(' ') }}</div>
      </div>
      <template #footer>
      <span class="flex flex-row items-center justify-end">
        <el-button @click="dialog.show = false">取消</el-button>
        <el-button type="primary">执行</el-button>
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

const state: { keyType: string, values: string[], ttl: number, commands: commandObjectType[] } = reactive({
  keyType: '',
  values: [],
  ttl: 0,
  commands: []
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
    const redisValue: string = await client.sendCommand(['get', props.targetKey])
    state.values.push(redisValue)
  } else if (state.keyType === 'hash') {
    state.values = await client.sendCommand(['hgetall', props.targetKey])
  } else if (state.keyType === 'list') {
    state.values = await client.sendCommand(['lrange', props.targetKey, '0', '-1'])
  } else if (state.keyType === 'set') {
    state.values = await client.sendCommand(['smembers', props.targetKey])
  } else if (state.keyType === 'zset') {
    state.values = await client.sendCommand(['zrange', props.targetKey, '0', '-1', 'withscores'])
  } else {
    state.values.push('未知类型')
  }

  state.ttl = await client.ttl(props.targetKey)

  await client.disconnect()
}
const handleCommand = (commands: commandObjectType[]) => {
  state.commands = []
  state.commands = commands
  dialog.show = true
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
