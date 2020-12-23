import { createApp } from "vue"
import router from "@/router"
import store from "@/store/index"
import axios from "@/apis/axios"
import "@/main.css"
import "@/themes/default.css"
import App from "./App.vue"

window.axios = axios

const app = createApp(App)
app.use(router)
app.use(store)
app.mount("#app")
