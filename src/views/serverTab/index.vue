<template>
  <div class="container">
    <el-tabs
      v-model="state.activeTab"
      type="card"
      closable
      @tab-remove="removeTab"
      class="w-full"
    >
      <el-tab-pane
        v-for="item in data"
        :key="item.name"
        :label="item.db + ' ' + item.name"
        :name="item.db + ' ' + item.name"
      >
        <key-menu :server-tab="item" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef, reactive, watch } from 'vue'
import { useStore } from 'vuex'
import { serverTabType } from '@/store/modules/serverList'
import KeyMenu from '@/views/keyMenu/index.vue'

const store = useStore()
const state: { activeTab: string } = reactive({
  activeTab: ''
})
const removeTab = (targetName: string) => {
  store.dispatch('serverList/delTab', targetName)
}
const data: ComputedRef<serverTabType[]> = computed(() => store.getters.serverTabList)

watch(state, () => {
  store.commit('serverList/setCurrentServerTab', state.activeTab)
})
watch(() => store.getters.currentServerTab, () => {
  state.activeTab = store.getters.currentServerTab
})
</script>

<style scoped>

</style>
