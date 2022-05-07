<template>
  <div>
    <el-form :model="state.form" label-width="100px">
      <el-form-item :label="t('serverMenu.form.name')" required>
        <el-input v-model="state.form.name" :placeholder="t('serverMenu.form.namePlaceholder')"/>
      </el-form-item>
      <el-form-item :label="t('serverMenu.form.host')" required>
        <el-input v-model="state.form.host" placeholder="192.168.1.10"/>
      </el-form-item>
      <el-form-item :label="t('serverMenu.form.port')" required>
        <el-input type="number" v-model="state.form.port" placeholder="6379" class="clear-number-input"/>
      </el-form-item>
      <el-form-item :label="t('serverMenu.form.password')" required>
        <el-input v-model="state.form.password" placeholder="username:password"/>
      </el-form-item>
      <el-form-item>
        <div class="flex flex-row items-center justify-between">
          <div v-if="state.checkStatus === 1" style="color: #67C23A;" class="flex flex-row items-center">
            <check class="w-4 h-4 mr-1" style="color: #67C23A;"/>
            {{ t('serverMenu.form.successTip') }}
          </div>
          <div v-else-if="state.checkStatus === 2" style="color: #F56C6C;" class="flex flex-row items-center">
            <close-bold class="w-4 h-4 mr-1" style="color: #F56C6C;"/>
            {{ t('serverMenu.form.name') }}
          </div>
          <div v-else></div>
          <div class="flex flex-row items-center justify-end">
            <el-button @click="handleCancel()">{{ t('serverMenu.form.cancelBtn') }}</el-button>
            <el-button type="danger" @click="handleDel()">{{ t('serverMenu.form.deleteBtn') }}</el-button>
            <el-button type="primary" @click="handleSubmit()">{{ t('serverMenu.form.saveBtn') }}</el-button>
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
        <el-input v-model="state.form.tls.tlsCertFilePath" placeholder="tlsCertFile" class="mb-2">
          <template #append>
            <el-button @click="openDialog('tlsCertFile')">...</el-button>
          </template>
        </el-input>

        <el-input v-model="state.form.tls.tlsKeyFilePath" placeholder="tlsKeyFile" class="mb-2">
          <template #append>
            <el-button @click="openDialog('tlsKeyFile')">...</el-button>
          </template>
        </el-input>

        <el-input v-model="state.form.tls.tlsCaCertFilePath" placeholder="tlsCaCertFile">
          <template #append>
            <el-button @click="openDialog('tlsCaCertFile')">...</el-button>
          </template>
        </el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, onMounted, PropType, reactive, ref, watch } from 'vue'
import { serverType } from '@/utils/store'
import { getClient } from '@/utils/redis'
import { CloseBold, Check } from '@element-plus/icons-vue'
import { useStore } from 'vuex'
import { ElNotification } from 'element-plus/es'
import { useI18n } from 'vue-i18n'
import { remote } from 'electron'
import { readFileWithoutEn } from '@/utils/file'

const { t } = useI18n()

const store = useStore()
const props = defineProps({
  serverList: {
    type: Array as PropType<serverType[]>,
    required: true
  },
  form: {
    type: Object as PropType<serverType>,
    required: true
  }
})
const emit = defineEmits(['delete', 'cancel', 'submit'])
const state: { isConnected: boolean, form: serverType, originFormName: string } = reactive({
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
  },
  originFormName: ''
})
const checkList = ref<string[]>([])
const handleDel = async () => {
  await store.dispatch('serverList/delTabWithServerName', props.form.name)
  emit('delete', state.form.id)
}
const handleCancel = () => {
  emit('cancel', 'cancel')
}
const handleSubmit = async () => {
  // ping
  await ping()
  if (!state.isConnected) {
    return
  }

  // check name
  if (state.form.name !== state.originFormName) {
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
  }

  emit('submit', { server: state.form, originName: state.originFormName, eventName: 'submit' })
  ElNotification({
    title: t('serverMenu.notification.infoTitle'),
    message: t('serverMenu.notification.editSuccessMessage'),
    showClose: false,
    duration: 2000
  })
}
const ping = async () => {
  try {
    const client = getClient(state.form)
    await client.connect()

    const pingRes = await client.ping()
    if (pingRes === 'PONG') {
      state.isConnected = true
    }

    await client.disconnect()
  } catch (err) {
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
const fetchData = async () => {
  state.form = JSON.parse(JSON.stringify(props.form))
  state.originFormName = props.form.name
  console.log('state.form : ', state.form)
  if (state.form.tls) {
    if (state.form.tls.tlsCertFilePath || state.form.tls.tlsKeyFilePath || state.form.tls.tlsCaCertFilePath) {
      checkList.value.push('TLS')
    }
  }
}

watch(props, () => {
  state.form = props.form
})

onMounted(async () => {
  await fetchData()
})
</script>

<style scoped>
.clear-number-input:deep input[type="number"]::-webkit-outer-spin-button,
.clear-number-input:deep input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none !important;
}
</style>
