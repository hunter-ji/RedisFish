<template>
  <div class="value-content-container py-2 px-6">

    <div class="container py-2 w-full flex flex-row rounded">
      <el-input type="text" size="small" v-model="keyState.keyName" placeholder="Key" clearable>
        <template #prepend>
          <el-select v-model="keyState.keyType" placeholder="Select" size="small" style="width: 100px;">
            <el-option
              v-for="item in keyState.options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </template>
      </el-input>
    </div>

    <string-type :key-name="keyState.keyName" @submit="handleCommand" v-if="keyState.keyType === 'string'"/>
    <hash-type :key-name="keyState.keyName" @submit="handleCommand" v-else-if="keyState.keyType === 'hash'"/>
    <list-type :key-name="keyState.keyName" @submit="handleCommand" v-else-if="keyState.keyType === 'list'"/>
    <set-type :key-name="keyState.keyName" @submit="handleCommand" v-else-if="keyState.keyType === 'set'"/>
    <z-set-type :key-name="keyState.keyName" @submit="handleCommand" v-else-if="keyState.keyType === 'zset'"/>

    <el-dialog v-model="dialog.show" title="提示" width="50%" center>
      <div>将要执行如下命令：</div>
      <div class="h-80 overflow-y-auto flex flex-col justify-start p-2 bg-gray-300 mt-2">
        <div class="p-2" v-for="(item, index) in state.commands" :key="index">{{ item.command.join(' ') }}</div>
      </div>
      <template #footer>
      <span class="flex flex-row items-center justify-end">
        <el-button @click="dialog.show = false">取消</el-button>
        <el-button type="primary">执行</el-button>
      </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { defineProps, PropType, reactive } from 'vue'
import { serverTabType } from '@/store/modules/serverList'
import { getClient } from '@/utils/redis'
import StringType from './stringType.vue'
import HashType from './hashType.vue'
import ListType from './listType.vue'
import SetType from './setType.vue'
import ZSetType from './zsetType.vue'
import { commandObjectType } from '@/views/valueContent/index'
import { ElNotification } from 'element-plus/es'

const props = defineProps({
  serverTab: {
    type: Object as PropType<serverTabType>,
    required: true
  }
})

const state: { commands: commandObjectType[] } = reactive({
  commands: []
})
const dialog = reactive({
  show: false
})
const keyState: { keyType: string, keyName: string, options: { label: string, value: string }[] } = reactive({
  keyType: 'string',
  keyName: '',
  options: [
    {
      label: 'string',
      value: 'string'
    },
    {
      label: 'hash',
      value: 'hash'
    },
    {
      label: 'list',
      value: 'list'
    },
    {
      label: 'set',
      value: 'set'
    },
    {
      label: 'zset',
      value: 'zset'
    }
  ]
})

const client = getClient(props.serverTab)

const handleCommand = (commands: commandObjectType[]) => {
  if (!keyState.keyName.length) {
    ElNotification({
      title: '提示',
      message: '请填写key',
      showClose: false,
      duration: 2000
    })
    return
  }
  state.commands = []
  state.commands = commands
  dialog.show = true
}

</script>

<style>
.el-button {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
