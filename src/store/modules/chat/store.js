import actions from "./actions"
import mutations from "./mutations"

const getters = {
  socket: state => state.socket,
  getAllRooms: state => state.allRooms,
  getTypingUsers: state => state.typingUsers,
  getOpenWindow: state => state.openWindow,
  getNewUser: state => state.newUser,
  allMessages: state => {
    if (state.openWindow) {
      return state.messages[state.openWindow.id] || []
    }
    return []
  },
  getLastMessage: state => state.lastMessage,
  getUnreadCounts: state => state.unreadCounts,
}

const state = () => ({
  socket: null,
  allRooms: [],
  typingUsers: [],
  openWindow: null,
  newUser: null,
  messages: {},
  lastMessage: {},
  unreadCounts: [],
})

const module = {
  namespaced: true,
  actions,
  mutations,
  getters,
  state,
}

export default module
