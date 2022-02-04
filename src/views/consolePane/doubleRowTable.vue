<template>
  <div>
    <el-table
      :data="props.result"
      height="420"
      size="mini" border stripe
      style="width: 100%;">
      <el-table-column type="index" width="50"/>
      <el-table-column prop="field" label="field"/>
      <el-table-column prop="value" label="value"/>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { defineProps, PropType } from 'vue'
import { outputPaneResultDoubleRowType } from '@/views/consolePane/index'

const props = defineProps({
  result: {
    type: Array as PropType<outputPaneResultDoubleRowType[]>,
    required: true
  }
})
</script>
