import { createStore } from "vuex"
import chat from "@/store/modules/chat/store"
import auth from "@/store/modules/auth/store"

export default createStore({
	modules: { chat, auth }
})
