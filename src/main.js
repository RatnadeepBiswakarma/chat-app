import { createApp } from "vue"
import router from "@/router"
import store from "@/store/index"
import axios from "@/apis/axios"
import "@/main.css"
import "@/themes/default.css"
import App from "./App.vue"
import VueFinalModal from "vue-final-modal"
import Notify from "@/util/Notify"

window.axios = axios

const app = createApp(App)
app.config.isCustomElement = tag => tag === "ion-icon"
app.use(router)
app.use(store)
app.use(VueFinalModal())
app.use(Notify)

app.mount("#app")
