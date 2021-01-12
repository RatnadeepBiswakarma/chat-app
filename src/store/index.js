import { createStore } from "vuex"
import chat from "@/store/modules/chat/store"
import auth from "@/store/modules/auth/store"
import user from "@/store/modules/user/store"

export default createStore({
	modules: { chat, auth, user }
})
