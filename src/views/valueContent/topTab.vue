<template>
  <div class="container px-4 py-2 w-full flex flex-row rounded">
    <div class="text-green-500 italic mr-2">{{ props.keyType }}</div>
    <div
      @click.left.meta="copyKey(props.keyName, t('valueContent.notification.copySuccessMessage'))"
      @click.left.ctrl="copyKey(props.keyName, t('valueContent.notification.copySuccessMessage'))"
    >
      {{ props.keyName }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { copyKey } from '@/utils/copyFromTable'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  keyType: {
    type: String,
    required: true
  },
  keyName: {
    type: String,
    required: true
  }
})

</script>

<style scoped>
.container {
  background-color: #f5f5f5;
}

html.dark .container {
  background-color: #32302f;
}
</style>
