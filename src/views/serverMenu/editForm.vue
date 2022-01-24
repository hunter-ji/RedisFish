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
        <el-input type="number" v-model="state.form.port" placeholder="6379"/>
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

const props = defineProps({
  form: {
    type: Object as PropType<serverType>,
    required: true
  }
})
const emit = defineEmits(['delete', 'cancel', 'submit'])
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
const handleDel = async () => {
  emit('delete', state.form.id)
}
const handleCancel = () => {
  emit('cancel', 'cancel')
}
const handleSubmit = async () => {
  await ping()
  if (state.checkStatus === 1) {
    emit('submit', 'submit')
  }
}
const ping = async () => {
  state.checkStatus = 2
  const client = getClient(state.form)
  await client.connect()

  const pingRes = await client.ping()
  if (pingRes === 'PONG') {
    state.checkStatus = 1
  }

  await client.disconnect()
}

watch(props, () => {
  state.form = props.form
})

onMounted(() => {
  state.form = props.form
})
</script>