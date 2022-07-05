<template>
  <div class="p-4 flex flex-row items-center">
    <div class="w-40 font-bold">{{ t('config.language.label') }}:</div>
    <el-radio-group v-model="radio" @change="handleChange">
      <el-radio :label="1" class="w-20">{{ t('config.language.zh') }}</el-radio>
      <el-radio :label="2" class="w-20">{{ t('config.language.en') }}</el-radio>
      <el-radio :label="3" class="w-20">{{ t('config.language.auto') }}</el-radio>
    </el-radio-group>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

const { t, locale } = useI18n()
const store = useStore()

const radio = ref(3)

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
const handleChange = async (label: number) => {
  handleLanguageSwitch(label)
  await store.dispatch('config/updateLanguage', label)
}

onMounted(() => {
  radio.value = store.getters.language || 3
})
</script>
