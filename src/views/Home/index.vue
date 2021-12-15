<template lang="pug">
div.container
    server-menu(class="w-1/3")

    divider

    key-tab
</template>

<script setup>
import serverMenu from '../serverMenu/index.vue'
import keyTab from '../keyTab/index.vue'
</script>

<style scoped>
.container {
    display: flex;
    flex-direction: row;
}
</style>
