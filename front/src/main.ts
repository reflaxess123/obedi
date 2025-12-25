import { createApp } from 'vue'
import App from '@app/App.vue'
import { router } from '@app/router'
import { registerProviders } from '@app/providers'
import '@app/styles/main.css'

const app = createApp(App)

registerProviders(app)
app.use(router)

app.mount('#app')
