const actions = {
  UPDATE_MY_DETAILS({ commit }, details) {
    commit("SET_MY_DETAILS", details)
  },
  UPDATE_BROWSER_NOTIFICATION({ commit }, state) {
    commit("SET_BROWSER_NOTIFICATION", state)
  }
}

export default actions
