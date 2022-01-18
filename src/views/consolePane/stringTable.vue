<template>
  <div class="p-2 rounded border-2 overflow-y-auto" style="height: 420px;">
    {{ props.content }}
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, reactive } from 'vue'

const props = defineProps({
  content: {
    type: String,
    required: true
  }
})
const state: { val: string } = reactive({
  val: ''
})
const stringFormat = (data: string) => {
  try {
    const jsonData = JSON.parse(data)
    state.val = JSON.stringify(jsonData, null, '\t')
  } catch (error) {
    console.log('error : ', error)
    state.val = data
  }
}

onMounted(() => {
  // stringFormat(props.content)
})
</script>
