<template>
  <div class="Monitor px-4 py-8 w-full">
    <div class="charts w-full flex flex-col justify-center items-center">
      <cpu :server-tab="props.serverTab" class="mb-2" />
      <memory :server-tab="props.serverTab" class="mb-2" />
      <client-count :server-tab="props.serverTab" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, PropType } from 'vue'
import { serverTabType } from '@/store/modules/serverList'
import Memory from './memory.vue'
import Cpu from './cpu.vue'
import ClientCount from './clientCount.vue'

const props = defineProps({
  serverTab: {
    type: Object as PropType<serverTabType>,
    required: true
  }
})
</script>

<style scoped>
.Monitor {
  height: 90vh;
}
.charts {
  height: 100%;
  overflow-y: auto;
}
</style>
