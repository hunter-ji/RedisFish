<template>
  <div class="sub-content w-full h-full bg-white shadow rounded">
    <!-- title -->
    <div class="sub-content-title flex flex-row justify-between items-center p-4">
      <div @click="copyKey(props.cardInfo.label)">{{ props.cardInfo.label }}</div>
      <div class="flex flex-row justify-center items-center">
        <div class="point" :style="{ 'background-color': props.cardInfo.isSub ? '#67C23A' : ''}" />
        <p class="text-gray-500 ml-2">{{ props.cardInfo.isSub ? '订阅中' : '' }}</p>
      </div>
      <div class="flex flex-row items-center">
        <el-button size="small" @click="clear">清空</el-button>
        <el-button type="success" size="small" @click="toggleSub" v-if="!props.cardInfo.isSub">开始订阅</el-button>
        <el-button type="danger" size="small" @click="toggleSub" v-else>结束订阅</el-button>
      </div>
    </div>

    <!-- messages -->
    <div class="sub-content-container">
      <div v-if="!props.cardInfo.messages.length" class="h-full flex flex-col justify-center items-center">
        <el-icon size="100" color="rgba(140, 147, 157, 0.33)"><chat-line-square /></el-icon>
        <p style="color: rgba(140, 147, 157, 0.33);" class="mt-4">暂无消息</p>
      </div>
      <div v-for="(item, index) in props.cardInfo.messages" :key="index" v-else class="py-1">
        <p class="text-gray-500 font-sm px-4">{{ item.time }}</p>
        <div class="sub-content-item py-2 px-4" v-if="!checkIsJSON(item.message)" @click="copyKey(item.message)">{{ formatJson(item.message) }}</div>
        <json-viewer class="sub-content-item" :value="JSON.parse(item.message)" v-else @click="copyKey(item.message)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, PropType, defineEmits } from 'vue'
import { subItemType } from '@/views/pubAndSub/index'
import { ElIcon } from 'element-plus'
import { ChatLineSquare } from '@element-plus/icons-vue'
import { copyKey } from '@/utils/copyFromTable'
import { checkIsJSON } from '@/utils/checkIsJson'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import JsonViewer from 'vue-json-viewer'

const props = defineProps({
  cardInfo: {
    required: true,
    type: Object as PropType<subItemType>
  }
})
const emit = defineEmits(['toggleSub', 'clear'])

const toggleSub = async () => {
  emit('toggleSub')
}
const clear = async () => {
  emit('clear', props.cardInfo.label)
}
const formatJson = (message: string): string => {
  const isJson = checkIsJSON(message)
  if (isJson) {
    console.log(JSON.stringify(JSON.parse(message), null, 2))
    return JSON.stringify(JSON.parse(message), null, 2)
  }
  return message
}
</script>

<style scoped>
.point {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.sub-content-title {
  border: none;
  border-bottom: 1px solid rgba(140, 147, 157, 0.33);
}
.sub-content-container {
  height: 56vh;
  overflow-y: auto;
  overflow-x: hidden;
}
.sub-content-item:hover {
  background-color: rgb(224, 224, 224, 0.1);
}
</style>
