<template>
  <router-view/>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

const { locale } = useI18n()
const store = useStore()

const initConfig = async () => {
  await store.dispatch('config/init')
}
const switchLanguageToZH = () => {
  locale.value = 'zh_CN'
}
const switchLanguageToEN = () => {
  locale.value = 'en_GB'
}
const switchLanguageToAuto = () => {
  switch (navigator.language) {
    // 环境语言中间的线是居中的
    case 'zh-CN':
      switchLanguageToZH()
      break
    case 'en-GB':
      switchLanguageToEN()
      break
    default:
      switchLanguageToEN()
  }
}
const handleLanguageSwitch = (label: number) => {
  switch (label) {
    case 1:
      switchLanguageToZH()
      break
    case 2:
      switchLanguageToEN()
      break
    case 3:
      switchLanguageToAuto()
      break
    default:
      switchLanguageToAuto()
  }
}

const fetchData = async () => {
  let language = store.getters.language
  if (!language) {
    language = 3
  }
  handleLanguageSwitch(language)
}

onMounted(async () => {
  await initConfig()
  await fetchData()
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
