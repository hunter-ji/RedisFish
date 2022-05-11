<template>
  <div class="publish-container dark-bg p-4 rounded bg-gray-50">
    <!-- input -->
    <el-input type="textarea" rows="3" resize="none" v-model="state.message" />

    <!-- channel & btn -->
    <div class="flex flex-row justify-between items-center mt-2">
      <el-select
        v-model="state.channel"
        filterable
        allow-create
        default-first-option
        :reserve-keyword="false"
        placeholder="Channel"
        @change="handleSelectChange"
      >
        <el-option
          v-for="item in state.options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>

      <el-button type="primary" @click="publish">{{ t('pubAndSub.send') }}</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, PropType, reactive } from 'vue'
import { serverTabType } from '@/store/modules/serverList'
import { getClient } from '@/utils/redis'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  serverTab: {
    type: Object as PropType<serverTabType>,
    required: true
  }
})

const client = getClient(props.serverTab)
const publisher = client.duplicate()
const state: { message: string, channel: string, options: {label: string, value: string}[] } = reactive({
  message: '',
  channel: '',
  options: []
})
const handleSelectChange = (val: string) => {
  const item: {label: string, value: string} = { label: val, value: val }
  if (state.options.indexOf(item) === -1) {
    state.options.push(item)
  }
}
const publish = async () => {
  await publisher.connect()
  await publisher.publish(state.channel, state.message)
  await publisher.disconnect()
  state.message = ''
}
const fetchData = async () => {
  await client.connect()
  await client.sendCommand(['select', props.serverTab.db.slice(-1)])
  const data = await client.sendCommand(['PUBSUB', 'CHANNELS'])
  state.options = []
  if (data && data.length) {
    data.forEach((item: string) => {
      state.options.push({
        label: item,
        value: item
      })
    })
    state.channel = data[0]
  } else {
    state.options.push({
      label: 'default',
      value: 'default'
    })
    state.channel = 'default'
  }
  await client.disconnect()
}

onMounted(() => {
  fetchData()
})
</script>
