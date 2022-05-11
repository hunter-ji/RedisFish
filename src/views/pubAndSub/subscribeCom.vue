<template>
  <div class="sub-container dark-bg flex flex-row items-center mb-4 bg-gray-50 rounded">

    <!-- channel container -->
    <div class="channel-container w-1/5 flex flex-col justify-between h-full">
      <!-- channel list -->
      <div class="channel-card-list flex flex-col items-center p-2">
        <sub-channel-card
          v-for="(item, index) in state.subChannelList"
          :key="index"
          :card-info="item"
          :current-sub-channel="state.currentSubChannel"
          :server-tab="props.serverTab"
          @click="state.currentSubChannel=item.label"
          @get-message="getMessage"
        />
      </div>

      <!-- add channel -->
      <div class="channel-card-btn flex flex-row justify-between items-center p-2" @keydown.enter="addNewChannel">
        <el-input type="text" size="small" v-model="state.channel" class="w-full">
          <template #append>
            <el-button :icon="Plus" @click="addNewChannel" />
          </template>
        </el-input>
      </div>
    </div>

    <!-- content -->
    <div class="channel-content w-4/5 h-full p-4">
      <sub-content :card-info="getCardInfo()" @toggle-sub="changeCardInfoSub" @clear="clearMessage" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, PropType, reactive } from 'vue'
import { serverTabType } from '@/store/modules/serverList'
import { subItemType, subMessageType } from '.'
import { Plus } from '@element-plus/icons-vue'
import SubChannelCard from './subChannelCard.vue'
import SubContent from './subContent.vue'
import { getClient } from '@/utils/redis'

const props = defineProps({
  serverTab: {
    type: Object as PropType<serverTabType>,
    required: true
  }
})

const state: { message: string, channel: string, currentSubChannel: string, subChannelList: subItemType[] } = reactive({
  message: '',
  channel: '',
  currentSubChannel: 'default',
  subChannelList: [
    {
      label: 'default',
      isSub: false,
      messages: []
    }
  ]
})
const addNewChannel = () => {
  if (state.channel.trim() === '') {
    return
  }

  state.subChannelList.push({
    label: state.channel,
    isSub: false,
    messages: []
  })
  state.currentSubChannel = state.channel
  state.channel = ''
}
const getCardInfo = (): subItemType => {
  const index = state.subChannelList.findIndex((item: subItemType) => item.label === state.currentSubChannel)
  return state.subChannelList[index]
}
const changeCardInfoSub = () => {
  const index = state.subChannelList.findIndex((item: subItemType) => item.label === state.currentSubChannel)
  state.subChannelList[index].isSub = !state.subChannelList[index].isSub
}
const getMessage = (message: subMessageType, channel: string) => {
  console.log('getMessage : ', channel, message)
  const index = state.subChannelList.findIndex((item: subItemType) => item.label === channel)
  state.subChannelList[index].messages.push(message)
}
const clearMessage = (channel: string) => {
  const index = state.subChannelList.findIndex((item: subItemType) => item.label === channel)
  state.subChannelList[index].messages = []
}

const client = getClient(props.serverTab)
const fetchData = async () => {
  await client.connect()
  await client.sendCommand(['select', props.serverTab.db.slice(-1)])
  const data = await client.sendCommand(['PUBSUB', 'CHANNELS'])
  if (data && data.length) {
    state.subChannelList = []
    data.forEach((item: string) => {
      state.subChannelList.push({
        label: item,
        isSub: false,
        messages: []
      })
    })
    state.currentSubChannel = data[0]
  }
  await client.disconnect()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.sub-container {
  width: 100%;
  height: 65vh;
}
.channel-card-list {
  height: 90%;
  overflow-y: auto;
  overflow-x: hidden;
}
.channel-card-btn {
  height: 10%;
}
</style>
