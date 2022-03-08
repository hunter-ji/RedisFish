<template>
  <div class="key-tab-container">
    <el-tabs
      v-model="state.activeTab"
      type="card"
      @tab-remove="removeTab"
      editable
      @edit="handleTabEdit"
      style="width: calc(100vw - 680px);"
    >
      <!-- console tab -->
      <el-tab-pane label="Console" name="Console" :closable="false">
        <command-pane :server-tab="props.serverTab" />
      </el-tab-pane>
      <!-- newKeyValue tab -->
      <el-tab-pane
        v-for="item in newKeyState.newKeyList"
        :key="item"
        :label="limitLen(item)"
        :name="item"
        :closable="true"
      >
        <new-key-value :server-tab="props.serverTab" @clearNewTab="handleNewTabFinishEvent($event, item)" />
      </el-tab-pane>
      <!-- valueContent -->
      <el-tab-pane
        v-for="item in data"
        :key="item"
        :label="limitLen(item)"
        :name="item"
        :closable="true"
      >
        <value-content :target-key="item" :server-tab="props.serverTab" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { useStore } from 'vuex'
import { computed, ComputedRef, defineEmits, defineProps, PropType, reactive, watch } from 'vue'
import { serverTabType } from '@/store/modules/serverList'
import { keyTabType } from '@/store/modules/keyList'
import ValueContent from '@/views/valueContent/index.vue'
import CommandPane from '@/views/consolePane/index.vue'
import NewKeyValue from '@/views/newKeyValue/index.vue'

const emit = defineEmits(['addKeyTab'])
const props = defineProps({
  serverTab: {
    type: Object as PropType<serverTabType>,
    required: true
  },
  targetKey: {
    type: String,
    required: true
  }
})

const store = useStore()
const state: { activeTab: string } = reactive({
  activeTab: 'Console'
})
const newKeyState: { newKeyList: string[], newKeyIndex: number } = reactive({
  newKeyList: [],
  newKeyIndex: 1
})
const removeTab = async (targetName: string) => {
  await store.dispatch('keyList/del', {
    serverLabel: `${props.serverTab.db} ${props.serverTab.name}`,
    key: targetName
  })

  if (data.value.length && state.activeTab !== 'Console') {
    state.activeTab = data.value[data.value.length - 1]
  } else if (!data.value.length) {
    state.activeTab = 'Console'
  }
}
const limitLen = (name: string): string => {
  return name.length > 6 ? name.slice(0, 6) + '...' : name
}
const addNewKey = async (keyName: string) => {
  newKeyState.newKeyList.push(keyName)
  newKeyState.newKeyIndex += 1
}
const removeNewKeyValueTab = async (targetName: string) => {
  newKeyState.newKeyList = newKeyState.newKeyList.filter((item: string) => item !== targetName)
  if (state.activeTab === targetName) state.activeTab = 'Console'
}
const handleTabEdit = async (targetName: string, action: 'remove' | 'add') => {
  if (action === 'add') {
    const keyName = `New${newKeyState.newKeyIndex}`
    await addNewKey(keyName)
    state.activeTab = keyName
  } else if (action === 'remove') {
    await removeNewKeyValueTab(targetName)
  }
}
const handleNewTabFinishEvent = async (keyName: string, targetName: string) => {
  await removeNewKeyValueTab(targetName)
  await emit('addKeyTab', keyName)
}
const data: ComputedRef<string[]> = computed(() => {
  const index = store.getters.keyTabList.findIndex((item: keyTabType) => item.serverLabel === `${props.serverTab.db} ${props.serverTab.name}`)
  return index !== -1 ? store.getters.keyTabList[index].values : []
})

watch(props, (newProps) => {
  state.activeTab = newProps.targetKey
})
</script>
