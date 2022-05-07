<template>
  <div>
    <el-form :model="state.form" label-width="100px">
      <el-form-item :label="t('serverMenu.form.name')" required>
        <el-input v-model="state.form.name" :placeholder="t('serverMenu.form.namePlaceholder')" maxlength="20" show-word-limit/>
      </el-form-item>
      <el-form-item :label="t('serverMenu.form.host')" required>
        <el-input v-model="state.form.host" placeholder="192.168.1.10"/>
      </el-form-item>
      <el-form-item :label="t('serverMenu.form.port')" required>
        <el-input type="number" v-model="state.form.port" placeholder="6379" class="clear-number-input"/>
      </el-form-item>
      <el-form-item :label="t('serverMenu.form.password')">
        <el-input type="text" v-model="state.form.password" placeholder="username:password"/>
      </el-form-item>
      <el-form-item>
        <div class="flex flex-row items-center justify-between">
          <div v-if="state.isConnected" style="color: #67C23A;" class="flex flex-row items-center">
            <check class="w-4 h-4 mr-1" style="color: #67C23A;"/>
            {{ t('serverMenu.form.successTip') }}
          </div>
          <div v-else style="color: #909399;" class="flex flex-row items-center">
            <paperclip class="w-4 h-4 mr-1" />
            {{ t('serverMenu.form.defaultTip') }}
          </div>
          <div class="flex flex-row items-center justify-end">
            <el-button @click="cancel()">{{ t('serverMenu.form.cancelBtn') }}</el-button>
            <el-button type="success" @click="ping()">{{ t('serverMenu.form.testBtn') }}</el-button>
            <el-button type="primary" @click="submit()">{{ t('serverMenu.form.saveBtn') }}</el-button>
          </div>
        </div>
      </el-form-item>

      <!-- check group -->
      <el-form-item>
          <el-checkbox-group v-model="checkList">
            <el-checkbox label="TLS"></el-checkbox>
          </el-checkbox-group>
      </el-form-item>

      <!-- tls -->
      <el-form-item v-if="checkList.indexOf('TLS') !== -1">
        <el-input v-model="state.form.tls.tlsCertFilePath" placeholder="tlsCertFile" class="mb-2" clearable>
          <template #append>
          <el-button @click="openDialog('tlsCertFile')">...</el-button>
          </template>
        </el-input>

        <el-input v-model="state.form.tls.tlsKeyFilePath" placeholder="tlsKeyFile" class="mb-2" clearable>
          <template #append>
            <el-button @click="openDialog('tlsKeyFile')">...</el-button>
          </template>
        </el-input>

        <el-input v-model="state.form.tls.tlsCaCertFilePath" placeholder="tlsCaCertFile" clearable>
          <template #append>
            <el-button @click="openDialog('tlsCaCertFile')">...</el-button>
          </template>
        </el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, onMounted, PropType, reactive, ref } from 'vue'
import { serverType } from '@/utils/store'
import { getClient } from '@/utils/redis'
import { CloseBold, Check, Paperclip } from '@element-plus/icons-vue'
import { ElNotification, ElButton } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { remote } from 'electron'
import { readFileWithoutEn } from '@/utils/file'

const { t } = useI18n()

const emit = defineEmits(['cancel', 'submit'])
const props = defineProps({
  serverList: {
    type: Array as PropType<serverType[]>,
    required: true
  }
})
const state: { isConnected: boolean, form: serverType } = reactive({
  isConnected: false,
  form: {
    id: 0,
    name: '',
    host: '',
    port: 6379,
    password: '',
    tls: {
      tlsCertFilePath: '',
      tlsKeyFilePath: '',
      tlsCaCertFilePath: '',
      tlsCertFile: '',
      tlsKeyFile: '',
      tlsCaCertFile: ''
    }
  }
})
const checkList = ref<string[]>([])
const clearFrom = async () => {
  setTimeout(() => {
    state.isConnected = false
    state.form = {
      id: 0,
      name: '',
      host: '',
      port: 6379,
      password: '',
      tls: {
        tlsCertFilePath: '',
        tlsKeyFilePath: '',
        tlsCaCertFilePath: '',
        tlsCertFile: '',
        tlsKeyFile: '',
        tlsCaCertFile: ''
      }
    }
  }, 1000)
}
const cancel = async () => {
  emit('cancel', 'cancel')
  await clearFrom()
}
const submit = async () => {
  // ping
  await ping()
  if (!state.isConnected) {
    return
  }

  // check name
  const serverIndex = props.serverList.findIndex((item: serverType) => item.name === state.form.name)
  if (serverIndex !== -1) {
    ElNotification({
      title: t('serverMenu.notification.infoTitle'),
      message: t('serverMenu.notification.errorMessage'),
      showClose: false,
      duration: 3000
    })
    return
  }

  emit('submit', { server: state.form, eventName: 'submit' })
  await clearFrom()
  ElNotification({
    title: t('serverMenu.notification.infoTitle'),
    message: t('serverMenu.notification.addSuccessMessage'),
    showClose: false,
    duration: 2000
  })
}
const ping = async () => {
  try {
    const client = getClient(state.form)
    const res = await client.connect()
    console.log('connect res : ', res)
    client.on('error', (error: string) => console.log('on err : ', error))

    const pingRes = await client.ping()
    if (pingRes === 'PONG') {
      state.isConnected = true
    }

    await client.disconnect()
  } catch (err) {
    console.log('err : ', err)
    state.isConnected = false
  }
}
const openDialog = async (pathType: string) => {
  const result = await remote.dialog.showOpenDialog({
    properties: ['openFile']
  })

  if (!result.filePaths.length) {
    return
  }

  const filePath = result.filePaths[0]
  if (pathType === 'tlsCertFile') {
    state.form.tls!.tlsCertFilePath = filePath
    const content = await readFileWithoutEn(filePath)
    if (content) {
      state.form.tls!.tlsCertFile = content
    }
  } else if (pathType === 'tlsKeyFile') {
    state.form.tls!.tlsKeyFilePath = filePath
    const content = await readFileWithoutEn(filePath)
    if (content) {
      state.form.tls!.tlsKeyFile = content
    }
  } else if (pathType === 'tlsCaCertFile') {
    state.form.tls!.tlsCaCertFilePath = filePath
    const content = await readFileWithoutEn(filePath)
    if (content) {
      state.form.tls!.tlsCaCertFile = content
    }
  }
}

onMounted(() => {
  const length = props.serverList.length
  state.form.id = length - 1
})
</script>

<style scoped>
.clear-number-input:deep input[type="number"]::-webkit-outer-spin-button,
.clear-number-input:deep input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none !important;
}
</style>
