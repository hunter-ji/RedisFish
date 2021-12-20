<template>
  <div class="container px-4 py-2 w-full flex flex-row rounded">
    <div class="text-green-500 italic mr-2">{{ props.keyType }}</div>
    <div>{{ props.keyName }}</div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

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

</script>

<style scoped>
.container {
  background-color: #f5f5f5;
}
</style>
