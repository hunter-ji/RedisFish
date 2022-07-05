<template>
  <div class="p-4 flex flex-row items-center">
    <div class="w-40 font-bold">{{ t('config.theme.label') }}:</div>
    <el-radio-group v-model="radio" @change="handleChange">
      <el-radio :label="1" class="w-20">{{ t('config.theme.light') }}</el-radio>
      <el-radio :label="2" class="w-20">{{ t('config.theme.dark') }}</el-radio>
      <el-radio :label="3" class="w-20">{{ t('config.theme.auto') }}</el-radio>
    </el-radio-group>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { handleThemeChange } from '@/utils/theme'

const { t } = useI18n()
const radio = ref(3)

const store = useStore()

const handleChange = async (label: number) => {
  await store.dispatch('config/updateTheme', label)
  handleThemeChange(label)
}

onMounted(() => {
  radio.value = store.getters.theme || 3
})
</script>
