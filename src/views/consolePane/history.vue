<template>
  <div>
    <el-table :data="props.res" border style="width: 100%" height="400">
      <el-table-column prop="command" :label="t('consolePane.history.command')"/>
      <el-table-column prop="result" :label="t('consolePane.history.result')"/>
      <el-table-column prop="createdAt" :label="t('consolePane.history.createdAt')"/>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { defineProps, PropType } from 'vue'
import { historyCommandType } from '@/views/consolePane/index'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  res: {
    type: Array as PropType<historyCommandType[]>,
    required: true
  }
})
</script>
