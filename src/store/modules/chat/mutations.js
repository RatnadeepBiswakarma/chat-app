const mutations = {
  SET_ALL_ROOMS(state, rooms) {
    state.allRooms = rooms
  },
  ADD_TYPING_ROOM(state, room_id) {
    if (!state.typingUsers.includes(room_id)) {
      state.typingUsers.push(room_id)
    }
  },
  REMOVE_TYPING_ROOM(state, room_id) {
    state.typingUsers = state.typingUsers.filter(id => id !== room_id)
  },
}

export default mutations
