<template>
  <div class="p-2 rounded border-2 overflow-y-auto" style="height: 420px;">
    {{ props.content }}
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps({
  content: {
    type: String,
    required: true
  }
})
</script>
