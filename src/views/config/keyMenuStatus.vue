<template>
  <div class="p-4 flex flex-row items-center">
    <div class="w-40 font-bold">{{ t('config.keyMenuStatus.label') }}:</div>
    <el-radio-group v-model="radio" @change="handleChange">
      <el-radio :label="1" class="w-20">{{ t('config.keyMenuStatus.group') }}</el-radio>
      <el-radio :label="2" class="w-20">{{ t('config.keyMenuStatus.filter') }}</el-radio>
    </el-radio-group>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

const { t } = useI18n()
const radio = ref(2)

const store = useStore()

const handleChange = async (label: number) => {
  await store.dispatch('config/updateKeyMenuStatus', label)
}

onMounted(() => {
  radio.value = store.getters.keyMenuStatus || 2
})
</script>
