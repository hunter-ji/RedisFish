<template>
  <div class="container w-full">
    <server-menu class="server-menu"/>

    <divider/>

    <server-tab class="w-full"/>
  </div>
</template>

<script setup lang="ts">
import ServerMenu from '../serverMenu/index.vue'
import ServerTab from '../serverTab/index.vue'
import Divider from '@/components/divider/index.vue'
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: row;
}

.server-menu {
  width: 250px;
  min-width: 250px;
  max-width: 250px;
}
</style>
