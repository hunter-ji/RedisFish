<template>
  <div>
    <el-form :model="state.form" label-width="100px">
      <el-form-item label="名称" required>
        <el-input v-model="state.form.name" placeholder="开发数据库"/>
      </el-form-item>
      <el-form-item label="地址" required>
        <el-input v-model="state.form.host" placeholder="192.168.1.10"/>
      </el-form-item>
      <el-form-item label="端口" required>
        <el-input type="number" v-model="state.form.port" placeholder="6379" class="clear-number-input"/>
      </el-form-item>
      <el-form-item label="密码" required>
        <el-input v-model="state.form.password" placeholder="username:password"/>
      </el-form-item>
      <el-form-item>
        <div class="flex flex-row items-center justify-between">
          <div v-if="state.checkStatus === 1" style="color: #67C23A;" class="flex flex-row items-center">
            <check class="w-4 h-4 mr-1" style="color: #67C23A;"/>
            连接成功
          </div>
          <div v-else-if="state.checkStatus === 2" style="color: #F56C6C;" class="flex flex-row items-center">
            <close-bold class="w-4 h-4 mr-1" style="color: #F56C6C;"/>
            无法连接
          </div>
          <div v-else></div>
          <div class="flex flex-row items-center justify-end">
            <el-button @click="handleCancel()">取消</el-button>
            <el-button type="danger" @click="handleDel()">删除</el-button>
            <el-button type="primary" @click="handleSubmit()">保存</el-button>
          </div>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, onMounted, PropType, reactive, watch } from 'vue'
import { serverType } from '@/utils/store'
import { getClient } from '@/utils/redis'
import { CloseBold, Check } from '@element-plus/icons-vue'
import { useStore } from 'vuex'
import { ElNotification } from 'element-plus/es'

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
const state: { checkStatus: number, form: serverType, originFormName: string } = reactive({
  checkStatus: 0,
  form: {
    id: 0,
    name: '',
    host: '',
    port: 6379,
    password: ''
  },
  originFormName: ''
})
const handleDel = async () => {
  await store.dispatch('serverList/delTabWithServerName', props.form.name)
  emit('delete', state.form.id)
}
const handleCancel = () => {
  emit('cancel', 'cancel')
}
const handleSubmit = async () => {
  // 检测连通性
  await ping()
  if (state.checkStatus !== 1) {
    return
  }

  // 检测name是否重复
  if (state.form.name !== state.originFormName) {
    const serverIndex = props.serverList.findIndex((item: serverType) => item.name === state.form.name)
    if (serverIndex !== -1) {
      ElNotification({
        title: '提示',
        message: '数据库名称重复',
        showClose: false,
        duration: 3000
      })
      return
    }
  }

  emit('submit', { server: state.form, originName: state.originFormName, eventName: 'submit' })
  ElNotification({
    title: '提示',
    message: '编辑数据库成功',
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

watch(props, () => {
  state.form = props.form
})

onMounted(() => {
  state.form = JSON.parse(JSON.stringify(props.form))
  state.originFormName = props.form.name
})
</script>

<style scoped>
.clear-number-input ::v-deep input[type="number"]::-webkit-outer-spin-button,
.clear-number-input ::v-deep input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none !important;
}
</style>
