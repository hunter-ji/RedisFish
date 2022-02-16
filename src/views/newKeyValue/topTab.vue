<template>
  <div class="container px-4 py-2 w-full flex flex-row rounded">
    <el-select v-model="state.keyType" placeholder="Select" size="small">
      <el-option
        v-for="item in state.options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      >
      </el-option>
    </el-select>
    <el-input type="text" v-model="state.keyName"/>
  </div>
</template>

<script setup lang="ts">
import { defineProps, reactive } from 'vue'

const props = defineProps({
  keyType: {
    type: String,
    required: true
  },
  keyName: {
    type: String,
    required: true
  }
})

const state: { keyType: string, keyName: string, options: { label: string, value: string }[] } = reactive({
  keyType: '',
  keyName: '',
  options: [
    {
      label: 'string',
      value: 'string'
    },
    {
      label: 'hash',
      value: 'hash'
    },
    {
      label: 'list',
      value: 'list'
    },
    {
      label: 'set',
      value: 'set'
    },
    {
      label: 'zset',
      value: 'zset'
    }
  ]
})
</script>

<style scoped>
.container {
  background-color: #f5f5f5;
}
</style>
