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
          <el-button @click="cancel()">取消</el-button>
          <el-button type="primary" @click="submit()">保存</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, onMounted, PropType, reactive } from 'vue'
import { serverType } from '@/utils/store'
import { useStore } from 'vuex'

const emit = defineEmits(['cancel', 'submit'])
const props = defineProps({
  serverList: {
    type: Array as PropType<serverType[]>,
    required: true
  }
})
const state: { form: serverType } = reactive({
  form: {
    id: 0,
    name: '',
    host: '',
    port: 6379,
    password: ''
  }
})
const store = useStore()
const clearFrom = async () => {
  state.form = {
    id: 0,
    name: '',
    host: '',
    port: 6379,
    password: ''
  }
}
const cancel = async () => {
  emit('cancel', 'cancel')
  await clearFrom()
}
const submit = async () => {
  // 检测name是否重复
  const serverIndex = props.serverList.findIndex((item: serverType) => item.name === state.form.name)
  if (serverIndex !== -1) {
    console.log('重复')
    return
  }

  // 合并serverList
  const serverList = props.serverList
  serverList.push(state.form)

  // 推送store
  await store.dispatch('serverList/updateServer', serverList)
  await store.dispatch('serverList/setServer')

  emit('submit', 'submit')
  await clearFrom()
}

onMounted(() => {
  const length = props.serverList.length
  state.form.id = length - 1
})
</script>
