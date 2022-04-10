<template>
  <div class="LogTab">
    <!-- history content -->
    <div class="history-content rounded-md py-4">
      <div class="px-4" v-if="state.content.length === 0">
        (nil)
      </div>
      <div class="log-item py-1" v-for="(item, index) in state.content" :key="index" @click="handleCopyLog(item)" v-else>
        <div class="px-4">{{ item.replaceAll('###', ' - ') }}</div>
      </div>
    </div>

    <!-- btn -->
    <div class="flex justify-end pt-2">
      <el-button type="success" @click="handleClearLog" :disabled="state.content.length === 0">清空日志</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { initLogFile, readLog, clearLog } from '@/utils/log'
import { defineProps, onMounted, PropType, reactive } from 'vue'
import { serverTabType } from '@/store/modules/serverList'
import { copyKey } from '@/utils/copyFromTable'

const props = defineProps({
  serverTab: {
    type: Object as PropType<serverTabType>,
    required: true
  }
})
const state: { content: string[] } = reactive({
  content: []
})
const fetchData = async () => {
  await initLogFile(props.serverTab.name, props.serverTab.db)
  state.content = await readLog(props.serverTab.name, props.serverTab.db)
}
const handleCopyLog = (logInfo: string) => {
  const arr = logInfo.split('###')
  copyKey(arr[arr.length - 1])
}
const handleClearLog = async () => {
  await clearLog(props.serverTab.name, props.serverTab.db)
  state.content = []
}
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.history-content {
  height: 65vh;
  overflow-y: auto;
  background-color: #282828;
  color: #fbf1c7;
}
.log-item:hover {
  background-color: rgb(224, 224, 224, 0.1);
}
</style>
