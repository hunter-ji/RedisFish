<template>
  <div>
    <el-card shadow="hover" class="w-full cursor-pointer" @click="dialogState.isShow = !dialogState.isShow">
      <div class="flex flex-row justify-center items-center">
        <el-icon><setting /></el-icon>
        <div class="ml-2">设置</div>
      </div>
    </el-card>

    <el-dialog v-model="dialogState.isShow" width="30%" center top="10vh" :title="t('config.title')">
      <config-content v-if="dialogState.isShow" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Setting } from '@element-plus/icons-vue'
import ConfigContent from './content.vue'
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const dialogState: { isShow: boolean } = reactive({
  isShow: false
})
</script>

<style scoped>
</style>
