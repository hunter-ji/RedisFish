import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import './styles/styles.css'
import 'element-plus/dist/index.css'

createApp(App).use(store).use(router).mount('#app')
