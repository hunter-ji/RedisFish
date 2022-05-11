<template>
  <div class="detail-container">
    <!--textarea-->
    <el-input
      v-model="localMessage"
      :autosize="{ minRows: 20, maxRows: 30 }"
      type="textarea"
      v-show="!checkIsJSON(localMessage)"
      @click="copyKey(localMessage)"
      :disabled="props.isReadOnly"
    />

    <!--ace-->
    <div :id="`ace${aceID}`" v-show="checkIsJSON(localMessage)" />

    <div class="flex flex-row justify-end mt-2">
      <el-button @click="handleCancel">{{ t('contentDetail.cancel') }}</el-button>
      <el-button type="primary" @click="handleSubmit" v-show="!props.isReadOnly">{{ t('contentDetail.submit') }}</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, Ref, defineProps, watch, defineEmits } from 'vue'
import ace from 'ace-builds'
import { copyKey } from '@/utils/copyFromTable'
import { checkIsJSON } from '@/utils/checkIsJson'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  isReadOnly: {
    type: Boolean,
    required: false,
    default: false
  }
})
const emit = defineEmits(['update', 'cancel'])

const localMessage = ref('')
const aceState: { aceEditor: any, themePath: string, modePath: string } = reactive({
  aceEditor: null,
  themePath: 'ace/theme/gruvbox',
  modePath: 'ace/mode/json'
})
const aceID: Ref<string> = ref('')
const genRandomAceID = async () => {
  aceID.value = String(new Date().getUTCMilliseconds())
}
const initAceEditor = async () => {
  aceState.aceEditor = ace.edit(`ace${aceID.value}`, {
    maxLines: 40, // 最大行数，超过会自动出现滚动条
    minLines: 20, // 最小行数，还未到最大行数时，编辑器会自动伸缩大小
    fontSize: 14, // 编辑器内字体大小
    theme: aceState.themePath, // 默认设置的主题
    mode: aceState.modePath, // 默认设置的语言模式
    tabSize: 4 // 制表符设置为 4 个空格大小
  })
  aceState.aceEditor.setReadOnly(props.isReadOnly || false)
}

onMounted(async () => {
  await genRandomAceID()
  await initAceEditor()

  localMessage.value = props.message

  if (checkIsJSON(localMessage.value)) {
    const jsonData = JSON.parse(localMessage.value)
    aceState.aceEditor.setValue(JSON.stringify(jsonData, null, '\t'), -1)
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
    aceState.aceEditor.setValue(JSON.stringify(jsonData, null, '\t'), -1)
  }
})
</script>
