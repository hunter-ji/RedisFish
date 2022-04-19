<template>
  <div class="ps-container p-4">
    <subscrib-com :server-tab="props.serverTab" />

    <publish-com :server-tab="props.serverTab" />
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, PropType, ref } from 'vue'
import { serverTabType } from '@/store/modules/serverList'
import { getClient } from '@/utils/redis'
import SubscribCom from './subscribCom.vue'
import PublishCom from './publishCom.vue'

const props = defineProps({
  serverTab: {
    type: Object as PropType<serverTabType>,
    required: true
  }
})

const message = ref('')

const client = getClient(props.serverTab)
const subscriber = client.duplicate()

const fetchData = async () => {
  await subscriber.connect()

  await subscriber.subscribe('helloTom', (message: string) => {
    console.log(message)
  })
}

onMounted(() => {
  // fetchData()
})
</script>
