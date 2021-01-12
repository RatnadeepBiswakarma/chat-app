import actions from "./actions"
import mutations from "./mutations"

const getters = {
	getActiveStatus: state => state.activeStatus
}

const state = () => ({
	activeStatus: false
})

const module = {
	namespaced: true,
	actions,
	mutations,
	getters,
	state
}

export default module
