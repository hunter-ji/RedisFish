<template>
  <div>
    <div class="tutorial pb-8 flex flex-row justify-center items-center text-md opacity-70" v-if="!store.getters.isVideoShow || store.getters.isVideoShow === 1">
      <el-icon><VideoPlay /></el-icon>
      <div class="pl-2" @click="jump">{{ t('videoTutorial') }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { VideoPlay } from '@element-plus/icons-vue'
import { useStore } from 'vuex'
import { shell } from 'electron'
import { ElMessage } from 'element-plus'

const { t, locale } = useI18n()
const store = useStore()

const jump = () => {
  if (locale.value === 'zh_CN') {
    shell.openExternal('https://www.bilibili.com/video/BV1Wf4y1d7JZ?share_source=copy_web')
  } else {
    ElMessage({ message: 'Sorry, not online yet', type: 'info' })
  }
}
</script>

<style scoped>
.tutorial:hover {
  opacity: 1;
  transform: rotate(6deg) scale(1.1);
  transition: transform 0.5s;
  cursor: pointer;
}
.tutorial:active {
  opacity: 1;
  transform: rotate(6deg) scale(1.3);
  transition: transform 0.5s;
  cursor: pointer;
}
</style>
