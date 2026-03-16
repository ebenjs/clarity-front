import './assets/main.css'

import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import { pinia } from './stores'

const nativeFetch = window.fetch.bind(window)

window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
	return nativeFetch(input, {
		credentials: 'include',
		...init,
	})
}

const app = createApp(App)

app.use(pinia)
app.use(router)

app.mount('#app')
