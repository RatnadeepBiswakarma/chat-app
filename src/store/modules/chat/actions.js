const actions = {
  UPDATE_ALL_ROOMS({ commit }, rooms) {
    commit("SET_ALL_ROOMS", rooms)
  },
}

export default actions
