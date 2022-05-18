<template>
  <div class="hot-key-container w-full flex flex-col p-4">
    <div class="flex flex-row items-center w-full">
      <div class="w-28 font-bold">{{ t('config.hotKey.copyLabel') }}:</div>
      <div><span class="btn">Command / Ctrl</span><span class="px-2">+</span><span class="btn">{{ t('config.hotKey.click') }}</span></div>
    </div>
    <div class="flex flex-row items-center w-full mt-1 mb-4">
      <div class="w-32"></div>
      <div class="text-gray-400">{{ t('config.hotKey.copyTip') }}</div>
    </div>
    <div class="flex flex-row items-center w-full">
      <div class="w-28 font-bold">{{ t('config.hotKey.viewLabel') }}:</div>
      <div><span class="btn">{{ t('config.hotKey.rightClick') }}</span></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<style scoped>
.hot-key-container span.btn {
  padding: 2px 4px;
  border-radius: 4px;
  background-color: rgba(252, 211, 211, 0.92);
  font-weight: bold;
  color: #F56C6C;
}
</style>
