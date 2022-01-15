<template>
  <div class="ace-container">
    <div id="ace"/>
  </div>
</template>

<script setup lang="ts">
import ace from 'ace-builds'
import 'ace-builds/webpack-resolver' // 在 webpack 环境中使用必须要导入
import 'ace-builds/src-noconflict/theme-monokai' // 默认设置的主题
import { onMounted, reactive, computed, ComputedRef, watch } from 'vue'

const state: { aceEditor: any, themePath: string } = reactive({
  aceEditor: null,
  themePath: 'ace/theme/monokai'
})

const getText = () => {
  console.log(state.aceEditor.getSelectedText())
}
onMounted(() => {
  state.aceEditor = ace.edit('ace', {
    maxLines: 20, // 最大行数，超过会自动出现滚动条
    minLines: 20, // 最小行数，还未到最大行数时，编辑器会自动伸缩大小
    fontSize: 14, // 编辑器内字体大小
    theme: state.themePath, // 默认设置的主题
    // mode: state.modePath, // 默认设置的语言模式
    tabSize: 4 // 制表符设置为 4 个空格大小
  })
})
</script>
