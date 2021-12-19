<template>
  <div class="container">
    <div>serverTab {{ props.serverTab }}</div>
    <div>key {{ props.targetKey }}</div>
    <div>values {{ state.values }}</div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, PropType, reactive } from 'vue'
import { serverTabType } from '@/store/modules/serverList'
import { getClient } from '@/utils/redis'

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

const state: { values: string[] } = reactive({
  values: []
})

const client = getClient(props.serverTab)
const fetchData = async () => {
  client.on('error', (err: string) => console.log('Redis Client Error', err))
  await client.connect()
  await client.sendCommand(['select', props.serverTab.db.slice(-1)])

  await client.sendCommand(['select', props.serverTab.db.slice(-1)])
  const keyType: string = await client.sendCommand(['type', 'e'])
  console.log('keyType : ', keyType)

  const redisValue: string = await client.sendCommand(['get', props.targetKey])
  console.log('redisValue : ', redisValue)
  state.values.push(redisValue)

  // if (keyType === 'string') {
  //   const redisValue: string = await client.sendCommand(['get', props.key])
  //   console.log('redisValue : ', redisValue)
  //   state.values.push(redisValue)
  // }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>

</style>
