<template>
  <div class="ace-container">
    <div id="ace"/>
  </div>
</template>

<script setup lang="ts">
import ace from 'ace-builds'
import 'ace-builds/webpack-resolver' // 在 webpack 环境中使用必须要导入
import 'ace-builds/src-noconflict/theme-gruvbox'
import { onMounted, reactive } from 'vue'

const state: { aceEditor: any, themePath: string } = reactive({
  aceEditor: null,
  themePath: 'ace/theme/gruvbox'
})
onMounted(() => {
  state.aceEditor = ace.edit('ace', {
    maxLines: 20,
    minLines: 20,
    fontSize: 14,
    theme: state.themePath,
    tabSize: 4,
    showPrintMargin: false
  })
})
</script>
