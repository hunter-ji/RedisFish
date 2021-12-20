<template>
  <div class="py-2 px-6">
    <string-type :key-name="props.targetKey" :values="state.values" v-if="state.keyType === 'string'" />
    <hash-type :key-name="props.targetKey" :values="state.values" v-else-if="state.keyType === 'hash'" />
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, PropType, reactive } from 'vue'
import { serverTabType } from '@/store/modules/serverList'
import { getClient } from '@/utils/redis'
import StringType from './stringType.vue'
import HashType from './hashType.vue'

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

const state: { keyType: string, values: string[] } = reactive({
  keyType: '',
  values: []
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
  } else {
    state.values.push('未知类型')
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>

</style>
