<template>
  <div>
    <top-tab :key-name="props.keyName" key-type="string" class="mb-4" />
    <div class="w-full flex flex-row justify-end mb-4">
      <el-button type="danger" size="small">删除</el-button>
      <el-button type="primary" size="small">提交</el-button>
    </div>
    <el-input v-model="state.val" :rows="20" type="textarea"/>
  </div>
</template>

<script setup lang="ts">
import { defineProps, PropType, reactive, watch } from 'vue'
import TopTab from './topTab.vue'

const props = defineProps({
  values: {
    type: Array as PropType<string[]>,
    required: true
  },
  keyName: {
    type: String,
    required: true
  }
})

const state: { val: string } = reactive({
  val: ''
})

watch(props, () => {
  if (props.values.length) state.val = props.values[0]
})
</script>
