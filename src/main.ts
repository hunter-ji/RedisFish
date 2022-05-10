import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import './styles/styles.css'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import i18n from './i18n'

createApp(App).use(i18n).use(store).use(router).mount('#app')
