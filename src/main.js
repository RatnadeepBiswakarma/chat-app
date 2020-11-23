import { createApp } from "vue"
import axios from "@/apis/axios"
import "@/main.css"
import "@/themes/default.css"
import App from "./App.vue"

window.axios = axios

createApp(App).mount("#app")
