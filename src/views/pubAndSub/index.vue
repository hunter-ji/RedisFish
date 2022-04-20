<template>
  <div class="ps-container p-4">
    <subscrib-com :server-tab="props.serverTab" />

    <publish-com :server-tab="props.serverTab" />
  </div>
</template>

<script setup lang="ts">
import { defineProps, PropType } from 'vue'
import { serverTabType } from '@/store/modules/serverList'
import SubscribCom from './subscribCom.vue'
import PublishCom from './publishCom.vue'

const props = defineProps({
  serverTab: {
    type: Object as PropType<serverTabType>,
    required: true
  }
})
</script>
