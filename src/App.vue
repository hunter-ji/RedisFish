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
const checkCtrlEvent = () => {
  // const sUserAgent = navigator.userAgent
  const isWin = (navigator.platform === 'Win32') || (navigator.platform === 'Windows')
  const isMac = (navigator.platform === 'Mac68K') || (navigator.platform === 'MacPPC') || (navigator.platform === 'Macintosh') || (navigator.platform === 'MacIntel')
  document.addEventListener('keydown', (e: {keyCode: number}) => {
    if ((e.keyCode === 17 && isWin) || (e.keyCode === 91 && isMac)) {
      // isCtrl.value = true
      store.commit('keyboardListen/setIsCtrl', true)
    }
  })
  document.addEventListener('keyup', (e: {keyCode: number}) => {
    if ((e.keyCode === 17 && isWin) || (e.keyCode === 91 && isMac)) {
      // isCtrl.value = false
      store.commit('keyboardListen/setIsCtrl', false)
    }
  })
}
const initTheme = () => {
  store.dispatch('config/init')
}

onMounted(() => {
  initTheme()
  fetchData()
  checkCtrlEvent()
})
</script>

<style>
body {
  font: 14px/1.5 "Helvetica Neue", Helvetica, Arial, "Microsoft Yahei", "Hiragino Sans GB", "Heiti SC", "WenQuanYi Micro Hei", sans-serif;
}
body.dark {
   background: #282828;
}
body.dark div.dark-bg {
  background-color: #1d2021;
}
body.dark div.dark-bg2 {
  background-color: #32302f;
}
</style>
