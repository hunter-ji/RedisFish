<template>
  <router-view/>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

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

const store = useStore()
const initTheme = () => {
  store.dispatch('config/init')
}

onMounted(() => {
  initTheme()
  fetchData()
})
</script>

<style>
body {
  font: 14px/1.5 "Helvetica Neue", Helvetica, Arial, "Microsoft Yahei", "Hiragino Sans GB", "Heiti SC", "WenQuanYi Micro Hei", sans-serif;
}
html {
  background-color: #ffffff;
}
html.dark {
   background: #282828;
}
html.dark div.dark-bg {
  background-color: #1d2021;
}
html.dark div.dark-bg2 {
  background-color: #32302f;
}
</style>
