import { createApp } from "vue"
import router from "@/router"
import store from "@/store/index"
import axios from "@/apis/axios"
import "@/main.css"
import "@/themes/default.css"
import App from "./App.vue"
import VueFinalModal from "vue-final-modal"

window.axios = axios

const app = createApp(App)
app.config.isCustomElement = tag => tag === "ion-icon"
app.use(router)
app.use(store)
app.use(VueFinalModal())
app.mount("#app")
