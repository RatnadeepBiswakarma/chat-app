const actions = {
  UPDATE_ALL_ROOMS({ commit }, rooms) {
    commit("SET_ALL_ROOMS", rooms)
  },
  INCLUDE_TYPING_ROOM({ commit }, room_id) {
    commit("ADD_TYPING_ROOM", room_id)
  },
  EXCLUDE_TYPING_ROOM({ commit }, room_id) {
    commit("REMOVE_TYPING_ROOM", room_id)
  },
  UPDATE_SOCKET({ commit }, socket) {
    commit("SET_SOCKET", socket)
  },
}

export default actions
