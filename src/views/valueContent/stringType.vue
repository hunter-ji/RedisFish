<template>
  <div>
    <!--top-tab-->
    <top-tab :key-name="props.keyName" key-type="string" class="mb-4"/>

    <!--tools-->
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
        <el-tooltip effect="light" :content="t('valueContent.btnGroup.refresh')" placement="bottom" :show-after="delayNumber">
          <el-button type="info" size="small" :icon="RefreshRight" circle @click="refresh"/>
        </el-tooltip>
        <el-tooltip effect="light" :content="t('valueContent.btnGroup.submit')" placement="bottom" :show-after="delayNumber">
          <el-button type="success" size="small" :icon="Check" circle @click="submit"/>
        </el-tooltip>
      </div>

    </div>

    <!--textarea-->
    <el-input v-model="state.val" :rows="30" type="textarea" v-show="editorModeState.mode === 'text'" @click.meta.exact="copyKey(state.val, t('valueContent.notification.copySuccessMessage'))"/>

    <!--ace-->
    <div :id="`ace${aceID}`" v-show="editorModeState.mode === 'json'"/>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, onMounted, PropType, reactive, Ref, ref, watch } from 'vue'
import TopTab from './topTab.vue'
import { commandObjectType, stringTypeSelectOptions } from '.'
import { ElNotification } from 'element-plus'
import { FormatCommandField } from '@/utils/formatCommandField'
import ace from 'ace-builds'
import { useI18n } from 'vue-i18n'
import { copyKey } from '@/utils/copyFromTable'
import { Check, RefreshRight } from '@element-plus/icons-vue'
import { checkIsJSON } from '@/utils/checkIsJson'

const { t } = useI18n()

const emit = defineEmits(['refresh', 'delete', 'submit'])
const delayNumber = ref(500)
const props = defineProps({
  values: {
    type: Array as PropType<string[]>,
    required: true
  },
  keyName: {
    type: String,
    required: true
  },
  ttl: {
    type: Number,
    required: true
  }
})
const state: { val: string, oldVal: string, jsonVal: string, ttl: number, oldTTL: number, commands: commandObjectType[] } = reactive({
  val: '',
  oldVal: '',
  jsonVal: '',
  ttl: 0,
  oldTTL: 0,
  commands: []
})
const aceState: { aceEditor: any, themePath: string, modePath: string } = reactive({
  aceEditor: null,
  themePath: 'ace/theme/gruvbox',
  modePath: 'ace/mode/json'
})
const editorModeState: { mode: string } = reactive({
  mode: 'text'
})
const refresh = () => {
  emit('refresh', true)
}
const stringFormat = (message: string): string => {
  return JSON.stringify(JSON.parse(message), null, '\t')
}
const syncJsonVal = async (): Promise<string> => {
  return aceState.aceEditor.getValue().replaceAll(/\s+/g, '')
}
const handleJsonInputBeforeSubmit = async (): Promise<string> => {
  if (editorModeState.mode === 'text') {
    return state.val === state.oldVal ? 'error' : state.val
  } else {
    const result = await syncJsonVal()
    return result === state.oldVal ? 'error' : result
  }
}
const submit = async () => {
  state.commands = []

  // ttl
  if (state.ttl !== 0 && state.ttl !== state.oldTTL) {
    state.commands.push({ command: ['EXPIRE', FormatCommandField(props.keyName), String(state.ttl)] })
  }

  // command
  const result = await handleJsonInputBeforeSubmit()
  if (result !== 'error') {
    state.commands.push({ command: ['SET', FormatCommandField(props.keyName), result] })
  }

  if (state.commands.length) {
    emit('submit', state.commands)
  } else {
    ElNotification({
      title: t('valueContent.notification.infoTitle'),
      message: t('valueContent.notification.emptyContentMessage'),
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
    maxLines: 45, // 最大行数，超过会自动出现滚动条
    minLines: 40, // 最小行数，还未到最大行数时，编辑器会自动伸缩大小
    fontSize: 14, // 编辑器内字体大小
    theme: aceState.themePath, // 默认设置的主题
    mode: aceState.modePath, // 默认设置的语言模式
    tabSize: 4 // 制表符设置为 4 个空格大小
  })
}
const handleAceUpdate = (message: string) => {
  if (checkIsJSON(message)) {
    aceState.aceEditor.setValue(stringFormat(message), -1)
  } else {
    aceState.aceEditor.setValue(message, -1)
  }
}
const autoSwitchMode = () => {
  editorModeState.mode = checkIsJSON(props.values[0]) ? 'json' : 'text'
}

onMounted(async () => {
  await genRandomAceID()
  await initAceEditor()
})

watch(props, () => {
  state.ttl = props.ttl
  state.oldTTL = props.ttl
  state.val = props.values[0]
  state.oldVal = props.values[0]
  state.jsonVal = props.values[0]

  // handleAceUpdate(props.values[0])
  autoSwitchMode()
})

watch(() => editorModeState.mode, async () => {
  if (editorModeState.mode === 'text') {
    state.val = await syncJsonVal()
  } else {
    handleAceUpdate(state.val)
  }
})
</script>
