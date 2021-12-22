<template lang="pug">
div.container.w-full
    server-menu.server-menu

    divider

    server-tab.w-full
</template>

<script setup lang="ts">
import serverMenu from '../serverMenu/index.vue'
import keyTab from '../keyTab/index.vue'
import serverTab from '../serverTab/index.vue'
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
