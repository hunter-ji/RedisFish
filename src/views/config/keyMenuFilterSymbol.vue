<template>
  <div class="p-4 flex flex-row items-center">
    <div class="w-40 font-bold">{{ t('config.keyMenuFilterSymbol.label') }}:</div>
    <el-radio-group v-model="radio" @change="handleChange">
      <el-radio :label="1" class="w-20"> :</el-radio>
      <el-radio :label="2" class="w-20"> _</el-radio>
      <el-radio :label="3" class="w-20"> -</el-radio>
      <el-radio :label="4" class="w-20"> #</el-radio>
      <el-radio :label="5" class="w-20"> =</el-radio>
      <el-radio :label="6" class="w-20"> +</el-radio>
    </el-radio-group>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

// 1 : 2 _ 3 - 4 # 5 = 6 +

const { t } = useI18n()
const radio = ref(1)

const store = useStore()

const handleChange = async (label: number) => {
  await store.dispatch('config/updateKeyMenuFilterSymbol', label)
}

onMounted(() => {
  radio.value = store.getters.keyMenuFilterSymbol || 1
})
</script>
