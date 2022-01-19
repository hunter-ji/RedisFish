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
        <div class="flex flex-row items-center justify-end">
          <el-button @click="handleCancel()">取消</el-button>
          <el-button type="danger" @click="handleDel()">删除</el-button>
          <el-button type="primary" @click="handleSubmit()">保存</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, onMounted, PropType, reactive, watch } from 'vue'
import { serverType } from '@/utils/store'

const props = defineProps({
  form: {
    type: Object as PropType<serverType>,
    required: true
  }
})
const emit = defineEmits(['delete', 'cancel', 'submit'])
const state: { form: serverType } = reactive({
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
  emit('submit', 'submit')
}

watch(props, () => {
  state.form = props.form
})

onMounted(() => {
  state.form = props.form
})
</script>
