<template>
  <div>
    <el-form :model="state.form" label-width="100px">
      <el-form-item label="名称" required>
        <el-input v-model="state.form.name" placeholder="开发数据库"/>
      </el-form-item>
      <el-form-item label="地址" required>
        <el-input v-model="state.form.name" placeholder="192.168.1.10"/>
      </el-form-item>
      <el-form-item label="端口" required>
        <el-input v-model="state.form.port" placeholder="6379"/>
      </el-form-item>
      <el-form-item label="密码" required>
        <el-input v-model="state.form.password" placeholder="username:password"/>
      </el-form-item>
      <el-form-item>
        <div class="flex flex-row items-center justify-end">
          <el-button>取消</el-button>
          <el-button type="primary">保存</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { serverType } from '@/utils/store'

const state: { form: serverType } = reactive({
  form: {
    id: 0,
    name: '',
    host: '',
    port: 6379,
    password: ''
  }
})
</script>
