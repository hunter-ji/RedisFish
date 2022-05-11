<template>
  <div class="channel-card dark-bg2 flex flex-row justify-between items-center p-4 w-full my-1 bg-white rounded shadow cursor-pointer hover:opacity-70 hover:shadow-xl" :class="props.cardInfo.label === props.currentSubChannel ? 'shadow-xl bg-blue-50' : ''">
    <div>{{ props.cardInfo.label.length > 24 ? props.cardInfo.label.slice(0, 20) + '...' : props.cardInfo.label }}</div>
    <div class="point shadow-xl" :style="{ 'background-color': props.cardInfo.isSub ? '#67C23A' : ''}" />
  </div>
</template>

<script setup lang="ts">
import { subItemType } from '.'
import { defineProps, PropType, watch, defineEmits, ref } from 'vue'
import { serverTabType } from '@/store/modules/serverList'
import { getClient } from '@/utils/redis'
import { timeFormat } from '@/utils/formatTime'

const props = defineProps({
  serverTab: {
    type: Object as PropType<serverTabType>,
    required: true
  },
  cardInfo: {
    required: true,
    type: Object as PropType<subItemType>
  },
  currentSubChannel: {
    required: true,
    type: String
  }
})
const emit = defineEmits(['getMessage'])

const client = getClient(props.serverTab)
const subscriber = client.duplicate()
const lock = ref<boolean>(false)

const fetchData = async () => {
  await subscriber.connect()

  await subscriber.subscribe(props.cardInfo.label, (message: string) => {
    emit('getMessage', {
      isSend: false,
      message: message,
      time: timeFormat()
    }, props.cardInfo.label)
  })
}
const handleClose = async () => {
  await subscriber.unsubscribe(props.cardInfo.label)
}

watch(props.cardInfo, async (first, second) => {
  if (first.label === second.label) {
    if (!lock.value && props.cardInfo.isSub) {
      await fetchData()
      lock.value = true
    } else if (!props.cardInfo.isSub) {
      await handleClose()
      lock.value = true
    }
  }
})
</script>

<style scoped>
.point {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
</style>
