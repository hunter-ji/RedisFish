<template>
  <div class="sub-content w-full h-full p-4 bg-white shadow rounded">
    <!-- title -->
    <div class="sub-content-title flex flex-row justify-between items-center pb-4">
      <div>{{ props.cardInfo.label }}</div>
      <div>{{ props.cardInfo.isSub ? '订阅中' : '' }}</div>
      <el-button type="success" size="small" @click="toggleSub" v-if="!props.cardInfo.isSub">开始订阅</el-button>
      <el-button type="danger" size="small" @click="toggleSub" v-else>结束订阅</el-button>
    </div>

    {{ props.cardInfo }}

    <!-- messages -->
    <div v-if="!props.cardInfo.messages.length" class="h-full flex flex-col justify-center items-center">
      <el-icon size="100" color="rgba(140, 147, 157, 0.33)"><chat-line-square /></el-icon>
      <p style="color: rgba(140, 147, 157, 0.33);" class="mt-4">暂无消息</p>
    </div>
    <div v-for="(item, index) in props.cardInfo.messages" :key="index" v-else class="pt-4">{{ item }}</div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, PropType, defineEmits } from 'vue'
import { subItemType } from '@/views/pubAndSub/index'
import { ElIcon } from 'element-plus'
import { ChatLineSquare } from '@element-plus/icons-vue'

const props = defineProps({
  cardInfo: {
    required: true,
    type: Object as PropType<subItemType>
  }
})
const emit = defineEmits(['toggleSub'])

const toggleSub = async () => {
  emit('toggleSub')
}
</script>

<style scoped>
.sub-content-title {
  border: none;
  border-bottom: 1px solid rgba(140, 147, 157, 0.33);
}
</style>
