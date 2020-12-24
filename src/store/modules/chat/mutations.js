import { hasKey } from "@/util/objectUtil"

const mutations = {
  SET_SOCKET(state, socket) {
    state.socket = socket
  },
  SET_ROOM_MESSAGE(state, data) {
    // initial fetch, store directly
    state.messages[data.room_id] = data.messages
  },
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
  SET_CHAT_CONTROLLER(state, controller) {
    state.chatController = controller
  },
  SET_CHAT_WINDOW(state, room) {
    state.openWindow = room
  },
  SET_NEW_USER_DETAILS(state, user) {
    state.newUser = user
  },
  SET_MESSAGES(state, message) {
    if (hasKey(state.messages, message.room_id)) {
      state.messages[message.room_id].push(message)
    } else {
      state.messages[message.room_id] = [message]
    }
    state.lastMessage = message
  },
  SET_ALL_MESSAGES(state, data) {
    state[data.room_id] = data.messages
  },
  SET_UNREAD_MESSAGE(state, message) {
    const localCopy = JSON.parse(JSON.stringify(state.unreadCounts))
    const index = localCopy.findIndex(item => item.room_id === message.room_id)
    if (index >= 0) {
      localCopy[index].count += 1
      state.unreadCounts = localCopy
    } else {
      state.unreadCounts = [
        ...localCopy,
        { count: 1, room_id: message.room_id },
      ]
    }
  },
  REMOVE_UNREAD_MESSAGE(state, room_id) {
    state.unreadCounts = state.unreadCounts.filter(
      item => item.room_id !== room_id
    )
  },
}

export default mutations
