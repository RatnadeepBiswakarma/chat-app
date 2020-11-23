import { createApp } from "vue"
import router from "@/router"
import axios from "@/apis/axios"
import "@/main.css"
import "@/themes/default.css"
import App from "./App.vue"

window.axios = axios

createApp(App)
  .use(router)
  .mount("#app")
