<template>
  <div class="sub-content dark-bg2 w-full h-full bg-white shadow rounded">
    <!-- title -->
    <div class="sub-content-title flex flex-row justify-between items-center p-4">
      <div @click="copyKey(props.cardInfo.label, t('valueContent.notification.copySuccessMessage'))">{{ props.cardInfo.label }}</div>
      <div class="flex flex-row justify-center items-center">
        <div class="point" :style="{ 'background-color': props.cardInfo.isSub ? '#67C23A' : ''}" />
        <p class="text-gray-500 ml-2">{{ props.cardInfo.isSub ? t('pubAndSub.inSub') : '' }}</p>
      </div>
      <div class="flex flex-row items-center">
        <el-button size="small" @click="clear">t('pubAndSub.clear')</el-button>
        <el-button type="success" size="small" @click="toggleSub" v-if="!props.cardInfo.isSub">{{ t('pubAndSub.startSub') }}</el-button>
        <el-button type="danger" size="small" @click="toggleSub" v-else>{{ t('pubAndSub.stopSub') }}</el-button>
      </div>
    </div>

    <!-- messages -->
    <div class="sub-content-container">
      <div v-if="!props.cardInfo.messages.length" class="h-full flex flex-col justify-center items-center">
        <el-icon size="100" color="rgba(140, 147, 157, 0.33)"><chat-line-square /></el-icon>
        <p style="color: rgba(140, 147, 157, 0.33);" class="mt-4">{{ t('pubAndSub.emptyMessage') }}</p>
      </div>
      <div v-for="(item, index) in props.cardInfo.messages" :key="index" v-else class="py-1">
        <p class="text-gray-500 font-sm px-4">{{ item.time }}</p>
        <div class="sub-content-item py-2 px-4" @click.left="copyKey(item.message, t('valueContent.notification.copySuccessMessage'))" @click.right="handleDetailShow(item.message)">{{ item.message }}</div>
      </div>
    </div>

    <!-- content detail -->
    <el-dialog v-model="contentDetailState.isShow" width="60%" center top="10vh">
      <content-detail :message="contentDetailState.message" :is-read-only="true" @cancel="handleDetailCancel" v-if="contentDetailState.isShow" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { defineProps, PropType, defineEmits, reactive } from 'vue'
import { subItemType } from '@/views/pubAndSub/index'
import { ElIcon } from 'element-plus'
import { ChatLineSquare } from '@element-plus/icons-vue'
import { copyKey } from '@/utils/copyFromTable'
import ContentDetail from '@/components/contentDetail/index.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  cardInfo: {
    required: true,
    type: Object as PropType<subItemType>
  }
})
const emit = defineEmits(['toggleSub', 'clear'])

const contentDetailState: { isShow: boolean, message: string } = reactive({
  isShow: false,
  message: ''
})
const handleDetailShow = (message: string) => {
  contentDetailState.message = message
  contentDetailState.isShow = true
}
const handleDetailCancel = () => {
  contentDetailState.isShow = false
}
const toggleSub = async () => {
  emit('toggleSub')
}
const clear = async () => {
  emit('clear', props.cardInfo.label)
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
