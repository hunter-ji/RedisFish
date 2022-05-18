<template>
  <div class="about-container flex flex-col justify-center items-center py-4">
    <img src="@/assets/icon.png" alt="logo" width="120" height="120" class="rounded-full shadow hover:shadow-xl" />
    <div class="mt-4 text-2xl">RedFish</div>
    <div class="mt-2 text-gray-400">v 0.1.1</div>
    <div class="mt-6"><el-link @click="jump">Github.com/Kuari/RedFish</el-link></div>
  </div>
</template>

<script setup lang="ts">
import { shell } from 'electron'

const jump = () => {
  shell.openExternal('https://github.com/Kuari/RedFish')
}
</script>
