import { hasKey } from "@/util/objectUtil"

const mutations = {
  SET_SOCKET(state, socket) {
    state.socket = socket
  },
  SET_PEER(state, peer) {
    state.peer = peer
  },
  SET_CALL(state, call) {
    state.call = call
  },
  SET_ROOM_MESSAGE(state, data) {
    if (data.oldMessages) {
      state.messages[data.room_id].unshift(...data.messages)
    } else {
      // initial fetch, store directly
      state.messages[data.room_id] = data.messages
    }
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
    state.latestMessages[message.room_id] = message
  },
  SET_DELIVERED(state, room_id) {
    if (state.messages[room_id]) {
      const localCopy = [...state.messages[room_id]]
      localCopy.forEach(m => {
        if (m.status === "sent") {
          m.status = "delivered"
        }
      })
      state.messages[room_id] = localCopy
    }
  },
  SET_READ(state, room_id) {
    if (state.messages[room_id]) {
      const localCopy = [...state.messages[room_id]]
      localCopy.forEach(msg => {
        msg.status = "read"
      })
      state.messages[room_id] = localCopy
    }
  },
  SET_ALL_MESSAGES(state, data) {
    state[data.room_id] = data.messages
  },
  SET_UNREAD_MESSAGE(state, message) {
    const localCopy = Object.assign({}, state.unreadCounts)
    if (hasKey(localCopy, message.room_id)) {
      localCopy[message.room_id].message = message
      localCopy[message.room_id].count += 1
    } else {
      localCopy[message.room_id] = { message, count: 1 }
    }
    state.unreadCounts = localCopy
    state.latestMessages[message.room_id] = message
  },
  SET_ALL_UNREADS(state, unreads) {
    state.unreadCounts = unreads
  },
  REMOVE_UNREAD_MESSAGE(state, room_id) {
    Reflect.deleteProperty(state.unreadCounts, room_id)
  },
  SET_NEW_ROOM(state, room) {
    state.allRooms = [room, ...state.allRooms]
  },
  SET_ONLINE_ROOM(state, data) {
    state.onlineRooms[data.room_id] = data.status
  },
  SET_MY_MEDIA_STREAM(state, stream) {
    state.myMediaStream = stream
  },
  SET_CALL_CONNECTION_STATUS(state, status) {
    state.callConnected = status
  }
}

export default mutations
