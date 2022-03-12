<template>
  <router-view/>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const state: { language: string } = reactive({
  language: 'en_GB'
})
const fetchData = () => {
  switch (navigator.language) {
    // 环境语言中间的线是居中的
    case 'zh-CN':
      state.language = 'zh_CN'
      locale.value = 'zh_CN'
      break
    case 'en-GB':
      state.language = 'en_GB'
      locale.value = 'en_GB'
      break
    default:
      state.language = 'en_GB'
      locale.value = 'en_GB'
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

body {
  font: 14px/1.5 "Helvetica Neue", Helvetica, Arial, "Microsoft Yahei", "Hiragino Sans GB", "Heiti SC", "WenQuanYi Micro Hei", sans-serif;
}
</style>
