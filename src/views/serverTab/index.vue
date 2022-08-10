<template>
  <div class="server-tab-container pt-2 pl-2">
    <el-tabs
      v-model="state.activeTab"
      type="card"
      @tab-remove="removeTab"
      style="width: calc(100vw - 270px);"
      v-show="data.length"
    >
      <el-tab-pane
        v-for="item in data"
        :key="item.name"
        :label="item.db + ' ' + item.name"
        :name="item.db + ' ' + item.name"
        :closable="state.closable"
      >
        <key-menu-with-group :server-tab="item" class="w-full" v-if="keyMenuStatus" />
        <key-menu :server-tab="item" class="w-full" v-else />
      </el-tab-pane>
    </el-tabs>

    <!-- empty page -->
    <empty-page v-if="!data.length"/>
  </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef, reactive, watch } from 'vue'
import { useStore } from 'vuex'
import { serverTabType } from '@/store/modules/serverList'
import KeyMenu from '@/views/keyMenu/index.vue'
import KeyMenuWithGroup from '@/views/keyMenu/group.vue'
import EmptyPage from './emptyPage.vue'

const store = useStore()
const state: { activeTab: string, closable: boolean } = reactive({
  activeTab: '',
  closable: true
})
const removeTab = (targetName: string) => {
  store.dispatch('serverList/delTab', targetName)
}
const data: ComputedRef<serverTabType[]> = computed(() => store.getters.serverTabList)

const keyMenuStatus = computed(() => {
  console.log(store.getters.keyMenuStatus)
  return store.getters.keyMenuStatus === 1
})

watch(state, () => {
  store.commit('serverList/setCurrentServerTab', state.activeTab)
})
watch(() => store.getters.currentServerTab, () => {
  state.activeTab = store.getters.currentServerTab
})
</script>
