<template>
  <div>
    <el-table :data="props.res" border style="width: 100%" height="400">
      <el-table-column prop="command" label="执行命令"/>
      <el-table-column prop="result" label="执行结果"/>
      <el-table-column prop="createdAt" label="执行时间"/>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { defineProps, PropType } from 'vue'
import { historyCommandType } from '@/views/consolePane/index'

const props = defineProps({
  res: {
    type: Array as PropType<historyCommandType[]>,
    required: true
  }
})
</script>
