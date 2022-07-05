<template>
  <div class="h-full w-full flex flex-col justify-center items-center select-none">
    <div class="h-full w-full flex flex-col justify-center items-center" v-if="index === 0">
      <magic-stick style="color: rgba(140, 147, 157, 0.33);width: 6em;height: 6em;margin-bottom: 16px;" />
      <div style="color: rgba(140, 147, 157, 0.33);font-size: 20px;">{{ t('serverTab.emptyPage.message0') }}</div>
    </div>
    <div class="h-full w-full flex flex-col justify-center items-center" v-else-if="index === 1">
      <milk-tea style="color: rgba(140, 147, 157, 0.33);width: 6em;height: 6em;margin-bottom: 16px;" />
      <div style="color: rgba(140, 147, 157, 0.33);font-size: 20px;">{{ t('serverTab.emptyPage.message1') }}</div>
    </div>
    <div class="h-full w-full flex flex-col justify-center items-center" v-else-if="index === 2">
      <ice-cream style="color: rgba(140, 147, 157, 0.33);width: 6em;height: 6em;margin-bottom: 16px;" />
      <div style="color: rgba(140, 147, 157, 0.33);font-size: 20px;">{{ t('serverTab.emptyPage.message2') }}</div>
    </div>
    <div class="h-full w-full flex flex-col justify-center items-center" v-else-if="index === 3">
      <message style="color: rgba(140, 147, 157, 0.33);width: 6em;height: 6em;margin-bottom: 16px;" />
      <div style="color: rgba(140, 147, 157, 0.33);font-size: 20px;">{{ t('serverTab.emptyPage.message3') }}</div>
    </div>
    <div class="h-full w-full flex flex-col justify-center items-center" v-else-if="index === 4">
      <ice-cream-round style="color: rgba(140, 147, 157, 0.33);width: 6em;height: 6em;margin-bottom: 16px;" />
      <div style="color: rgba(140, 147, 157, 0.33);font-size: 20px;">{{ t('serverTab.emptyPage.message4') }}</div>
    </div>
    <div class="h-full w-full flex flex-col justify-center items-center" v-else-if="index === 5">
      <chat-line-square style="color: rgba(140, 147, 157, 0.33);width: 6em;height: 6em;margin-bottom: 16px;" />
      <div style="color: rgba(140, 147, 157, 0.33);font-size: 20px;">{{ t('serverTab.emptyPage.message5') }}</div>
    </div>
    <div class="h-full w-full flex flex-col justify-center items-center" v-else>
      <chat-line-square style="color: rgba(140, 147, 157, 0.33);width: 6em;height: 6em;margin-bottom: 16px;" />
      <div style="color: rgba(140, 147, 157, 0.33);font-size: 20px;">{{ t('serverTab.emptyPage.message5') }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { MagicStick, MilkTea, IceCream, Message, IceCreamRound, ChatLineSquare } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const index = ref<number>(0)

const genRandomIndex = async (n: number, m: number) => {
  index.value = Math.floor(Math.random() * (m - n + 1) + n)
}

onMounted(() => {
  genRandomIndex(0, 5)
})
</script>
