<template>
  <div>
    <el-table
      :data="props.result"
      height="420"
      size="mini" border stripe
      style="min-width: 900px;max-width: calc(100% - 750px);">
      <el-table-column type="index" width="50"/>
      <el-table-column prop="value" label="value"/>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { defineProps, PropType } from 'vue'
import { outputPaneResultType } from '@/views/consolePane/index'

const props = defineProps({
  result: {
    type: Array as PropType<outputPaneResultType[]>,
    required: true
  }
})
</script>
