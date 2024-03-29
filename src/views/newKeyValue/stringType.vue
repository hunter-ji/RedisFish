<template>
  <div>
    <div class="w-full flex flex-row justify-between mb-4">

      <!--ttl-->
      <div class="w-1/5 flex flex-row items-center">
        <div class="text-sm mr-1">TTL(s)</div>
        <el-input-number v-model="state.ttl" size="small" controls-position="right" :min="-1"/>
      </div>

      <!--mode switch-->
      <el-select v-model="editorModeState.mode" placeholder="Select" size="small">
        <el-option
          v-for="item in stringTypeSelectOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>

      <!--btn group-->
      <div class="flex flex-row items-center justify-end">
        <el-tooltip effect="light" :content="t('valueContent.btnGroup.submit')" placement="bottom" :show-after="delayNumber">
          <el-button type="success" size="small" :icon="Check" circle @click="submit"/>
        </el-tooltip>
      </div>
    </div>

    <!--textarea-->
    <el-input v-model="state.val" :rows="37" type="textarea" resize="none" v-show="editorModeState.mode === 'text'" />

    <!--ace-->
    <div :id="`ace${aceID}`" v-show="editorModeState.mode === 'json'"/>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, onMounted, reactive, Ref, ref } from 'vue'
import { Check } from '@element-plus/icons-vue'
import { commandObjectType, stringTypeSelectOptions } from '@/views/valueContent/index'
import { ElNotification } from 'element-plus'
import { FormatCommandField } from '@/utils/formatCommandField'
import ace from 'ace-builds'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const emit = defineEmits(['delete', 'submit'])
const delayNumber = ref(500)
const props = defineProps({
  keyName: {
    type: String,
    required: true
  }
})
const state: { val: string, ttl: number, commands: commandObjectType[] } = reactive({
  val: '',
  ttl: -1,
  commands: []
})
const aceState: { aceEditor: any, themePath: string, modePath: string } = reactive({
  aceEditor: null,
  themePath: 'ace/theme/gruvbox',
  modePath: 'ace/mode/json'
})
const editorModeState: { lock: boolean, mode: string } = reactive({
  lock: false,
  mode: 'text'
})
const syncJsonVal = async (): Promise<string> => {
  return aceState.aceEditor.getValue().replaceAll(/\s+/g, '')
}
const handleJsonInputBeforeSubmit = async (): Promise<string> => {
  if (editorModeState.mode === 'text') {
    return !state.val.length ? 'error' : state.val
  } else {
    const result = await syncJsonVal()
    return !result.length ? 'error' : result
  }
}
const submit = async () => {
  state.commands = []

  // command
  const result = await handleJsonInputBeforeSubmit()
  if (result !== 'error') {
    state.commands.push({ command: ['SET', FormatCommandField(props.keyName), result] })
  }

  // ttl
  if (state.ttl > 0) {
    state.commands.push({ command: ['EXPIRE', FormatCommandField(props.keyName), String(state.ttl)] })
  }

  if (state.commands.length) {
    emit('submit', state.commands)
  } else {
    ElNotification({
      title: t('newKeyValue.notification.infoTitle'),
      message: t('newKeyValue.notification.emptyContentMessage'),
      type: 'warning',
      duration: 2000
    })
  }
}
const aceID: Ref<string> = ref('')
const genRandomAceID = async () => {
  aceID.value = String(new Date().getUTCMilliseconds())
}
const initAceEditor = async () => {
  aceState.aceEditor = ace.edit(`ace${aceID.value}`, {
    maxLines: 42,
    minLines: 42,
    fontSize: 14,
    theme: aceState.themePath,
    mode: aceState.modePath,
    tabSize: 4,
    showPrintMargin: false
  })
}

onMounted(async () => {
  await genRandomAceID()
  await initAceEditor()
})
</script>
