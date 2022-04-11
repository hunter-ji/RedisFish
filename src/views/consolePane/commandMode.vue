<template>
  <div class="commandMode p-4">
    <div class="command-content rounded-md">

      <!-- command input -->
      <div class="command-input p-2 flex flex-row items-center h-12">
        <el-icon><arrow-right-bold /></el-icon>
        <input type="text" v-model="state.command" placeholder="回车以执行命令" class="w-full h-full pl-2" spellcheck="false" @keydown.enter="handleRun" />
      </div>

      <!-- command result -->
      <div class="command-result py-4">
        <div class="command-result-item py-2" v-for="(item, index) in state.history" :key="index">
          <div class="command-result-item__time text-xs px-4"># {{ item.createAt }}</div>
          <div class="command-result-item__command text-sm font-bold px-4 py-1 flex items-center justify-start" @click="copyKey(item.command)">
            <p class="pr-2">{{ props.serverTab.name }} > </p>
            {{ item.command }}
          </div>
          <div class="command-result-item__result px-4" v-if="item.results && item.results[0] === 'nil'">(nil)</div>
          <div class="command-result-item__result px-4 flex items-center" v-for="(item2, index2) in item.results" :key="index2" @click="copyKey(item2)" v-else>
            <div class="w-6 text-center">{{ index2 + 1 }})</div> {{ item2 }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElIcon } from 'element-plus'
import { ArrowRightBold } from '@element-plus/icons-vue'
import { defineProps, PropType, reactive } from 'vue'
import { commandHistoryItemType } from '.'
import { serverTabType } from '@/store/modules/serverList'
import { getClient } from '@/utils/redis'
import { dateFormat } from '@/utils/formatTime'
import { copyKey } from '@/utils/copyFromTable'
import { setLog } from '@/utils/log'

const props = defineProps({
  serverTab: {
    type: Object as PropType<serverTabType>,
    required: true
  }
})

const client = getClient(props.serverTab)
const state: { command: string, history: commandHistoryItemType[] } = reactive({
  command: '',
  history: []
})
const handleRun = async () => {
  if (state.command === '') {
    return
  }

  if (state.command === 'clear') {
    state.history = []
    return
  }

  const key = state.command
  let results = []

  await client.connect()
  await client.sendCommand(['select', props.serverTab.db.slice(-1)])

  const res = await client.sendCommand(key.split(' '))
  if (!res || res === [] || res.length === 0) {
    results.push('nil')
  } else {
    if (typeof res === 'string') {
      results.push(res)
    } else {
      results = res
    }
  }

  await client.disconnect()

  const createAt = dateFormat()

  state.command = ''
  state.history.unshift({
    command: key,
    results: results,
    createAt: createAt
  })

  await setLog(props.serverTab, key, createAt)
}
</script>

<style scoped>
.command-content {
  /*height: 800px;*/
  height: calc(90vh - 100px);
  background-color: #282828;
  color: #fbf1c7;
}
.command-input {
  border: none;
  border-bottom: 1px solid #8c939d;
}
.command-input input {
  background: none;
  outline: none;
  border: 0;
}
.command-input input:focus {
  outline: none;
}
.command-result {
  /*height: 750px;*/
  height: calc(90vh - 150px);
  overflow-y: scroll;
}
.command-result-item__time {
  color: #bdae93;
}
.command-result-item__command:hover,
.command-result-item__result:hover {
  background-color: rgb(224, 224, 224, 0.1);
}
</style>
