<template>
  <div class="detail-container">
    <!--textarea-->
    <el-input v-model="localMessage" :rows="30" type="textarea" v-show="!checkIsJSON(localMessage)" @click="copyKey(localMessage)"/>

    <!--ace-->
    <div :id="`ace${aceID}`" v-show="checkIsJSON(localMessage)" />

    <div class="flex flex-row justify-end mt-2">
      <el-button @click="handleCancel">关闭</el-button>
      <el-button type="primary" @click="handleSubmit">保存</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, Ref, defineProps, watch, defineEmits } from 'vue'
import ace from 'ace-builds'
import { copyKey } from '@/utils/copyFromTable'
import { checkIsJSON } from '@/utils/checkIsJson'

const props = defineProps({
  message: {
    type: String,
    required: true
  }
})
const emit = defineEmits(['update', 'cancel'])

const localMessage = ref('')
const aceState: { aceEditor: any, themePath: string, modePath: string } = reactive({
  aceEditor: null,
  themePath: 'ace/theme/monokai',
  modePath: 'ace/mode/json'
})
const aceID: Ref<string> = ref('')
const genRandomAceID = async () => {
  aceID.value = String(new Date().getUTCMilliseconds())
}
const initAceEditor = async () => {
  aceState.aceEditor = ace.edit(`ace${aceID.value}`, {
    maxLines: 50, // 最大行数，超过会自动出现滚动条
    minLines: 30, // 最小行数，还未到最大行数时，编辑器会自动伸缩大小
    fontSize: 14, // 编辑器内字体大小
    theme: aceState.themePath, // 默认设置的主题
    mode: aceState.modePath, // 默认设置的语言模式
    tabSize: 4 // 制表符设置为 4 个空格大小
  })
}

onMounted(async () => {
  await genRandomAceID()
  await initAceEditor()

  localMessage.value = props.message

  if (checkIsJSON(localMessage.value)) {
    const jsonData = JSON.parse(localMessage.value)
    aceState.aceEditor.setValue(JSON.stringify(jsonData, null, '\t'))
  }
})
const handleSubmit = () => {
  if (checkIsJSON(localMessage.value)) {
    const data = aceState.aceEditor.getValue().replaceAll(/\s+/g, '')
    emit('update', data)
  } else {
    emit('update', localMessage.value)
  }
}
const handleCancel = () => {
  emit('cancel')
}

watch(() => props.message, () => {
  localMessage.value = props.message
})

watch(localMessage, () => {
  if (checkIsJSON(localMessage.value)) {
    const jsonData = JSON.parse(localMessage.value)
    aceState.aceEditor.setValue(JSON.stringify(jsonData, null, '\t'))
  }
})
</script>

<style scoped>

</style>
