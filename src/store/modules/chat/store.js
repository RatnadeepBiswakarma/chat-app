import actions from "./actions"
import mutations from "./mutations"

const getters = {
  getAllRooms: state => state.allRooms,
  getChatWithRoom: state => state.chatWithRoom,
  getTypingUsers: state => state.typingUsers,
}

const state = () => ({
  chatWithRoom: null,
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
