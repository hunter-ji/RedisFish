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
      <el-form-item :label="t('serverMenu.form.password')" required>
        <el-input type="text" v-model="state.form.password" placeholder="username:password"/>
      </el-form-item>
      <el-form-item>
        <div class="flex flex-row items-center justify-between">
          <div v-if="state.checkStatus === 1" style="color: #67C23A;" class="flex flex-row items-center">
            <check class="w-4 h-4 mr-1" style="color: #67C23A;"/>
            {{ t('serverMenu.form.successTip') }}
          </div>
          <div v-else-if="state.checkStatus === 2" style="color: #F56C6C;" class="flex flex-row items-center">
            <close-bold class="w-4 h-4 mr-1" style="color: #F56C6C;"/>
            {{ t('serverMenu.form.failTip') }}
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
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, onMounted, PropType, reactive } from 'vue'
import { serverType } from '@/utils/store'
import { getClient } from '@/utils/redis'
import { CloseBold, Check, Paperclip } from '@element-plus/icons-vue'
import { ElNotification } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const emit = defineEmits(['cancel', 'submit'])
const props = defineProps({
  serverList: {
    type: Array as PropType<serverType[]>,
    required: true
  }
})
const state: { checkStatus: number, form: serverType } = reactive({
  checkStatus: 0,
  form: {
    id: 0,
    name: '',
    host: '',
    port: 6379,
    password: ''
  }
})
const clearFrom = async () => {
  setTimeout(() => {
    state.checkStatus = 0
    state.form = {
      id: 0,
      name: '',
      host: '',
      port: 6379,
      password: ''
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
  if (state.checkStatus !== 1) {
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
    await client.connect()

    const pingRes = await client.ping()
    if (pingRes === 'PONG') {
      state.checkStatus = 1
    }

    await client.disconnect()
  } catch (err) {
    state.checkStatus = 2
  }
}

onMounted(() => {
  const length = props.serverList.length
  state.form.id = length - 1
})
</script>

<style scoped>
.clear-number-input ::v-deep input[type="number"]::-webkit-outer-spin-button,
.clear-number-input ::v-deep input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none !important;
}
</style>
