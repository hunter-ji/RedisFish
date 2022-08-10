<template>
  <div class="flex flex-col">
    <theme-com />
    <video-show />
    <language />
    <key-menu-filter-symbol />
    <key-menu-status />
  </div>
</template>

<script setup lang="ts">
import ThemeCom from './theme.vue'
import VideoShow from './videoShow.vue'
import Language from './language.vue'
import KeyMenuFilterSymbol from './keyMenuFilterSymbol.vue'
import KeyMenuStatus from './keyMenuStatus.vue'
</script>
