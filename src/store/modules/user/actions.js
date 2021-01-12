const actions = {
	UPDATE_USER_ACTIVE_STATE({ commit }, status) {
		commit("SET_USER_ACTIVE_STATE", status)
	}
}

export default actions
