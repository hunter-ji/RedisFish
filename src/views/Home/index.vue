<template lang="pug">
div.container
    server-menu(class="w-1/3")

    divider

    server-tab
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
</style>
