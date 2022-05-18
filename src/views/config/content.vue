<template>
  <div class="content-container">
    <el-tabs v-model="activeName" class="demo-tabs">
      <el-tab-pane :label="t('config.tabGroup.general')" name="general"><general-com /></el-tab-pane>
      <el-tab-pane :label="t('config.tabGroup.hotKey')" name="hotKey"><hot-key /></el-tab-pane>
      <el-tab-pane :label="t('config.tabGroup.about')" name="about"><about /></el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import GeneralCom from './theme.vue'
import HotKey from './hotKey.vue'
import About from './about.vue'

const { t } = useI18n()
const activeName = ref('general')
</script>

<style scoped>
.content-container {
  min-height: 400px;
}
</style>
