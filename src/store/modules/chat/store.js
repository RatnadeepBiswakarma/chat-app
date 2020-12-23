import actions from "./actions"
import mutations from "./mutations"

const getters = {
  getAllRooms: state => state.allRooms,
  getChatWithRoom: state => state.chatWithRoom,
  getTypingUsers: state => state.typingUsers,
  getSocket: state => state.socket,
}

const state = () => ({
  chatWithRoom: null,
  socket: null,
  allRooms: [],
  typingUsers: [],
})

const module = {
  namespaced: true,
  actions,
  mutations,
  getters,
  state,
}

export default module
