import { getRooms } from "@/apis/room"

const actions = {
  UPDATE_SOCKET({ commit }, socket) {
    commit("SET_SOCKET", socket)
  },
  UPDATE_ROOM_MESSAGES({ commit }, payload) {
    commit("SET_ROOM_MESSAGE", payload)
  },
  UPDATE_ALL_ROOMS({ commit, state, rootState }) {
    getRooms()
      .then(res => {
        commit("SET_ALL_ROOMS", res.data.rooms)
        state.socket.emit("all_messages_delivered", {
          user_id: rootState.auth.myDetails.id
        })
      })
      .catch(err => {
        console.log(err)
      })
  },
  UPDATE_DELIVERED({ commit }, room_id) {
    commit("SET_DELIVERED", room_id)
  },
  UPDATE_READ({ commit }, room_id) {
    commit("SET_READ", room_id)
  },
  UPDATE_ALL_MESSAGES({ commit }, data) {
    commit("SET_ALL_MESSAGES", data)
  },
  UPDATE_NEW_MESSAGE({ commit }, message) {
    commit("SET_MESSAGES", message)
  },
  INCLUDE_TYPING_ROOM({ commit }, room_id) {
    commit("ADD_TYPING_ROOM", room_id)
  },
  EXCLUDE_TYPING_ROOM({ commit }, room_id) {
    commit("REMOVE_TYPING_ROOM", room_id)
  },
  UPDATE_CHAT_WINDOW({ commit }, room) {
    commit("SET_CHAT_WINDOW", room)
  },
  UPDATE_NEW_USER_DETAILS({ commit }, room) {
    commit("SET_NEW_USER_DETAILS", room)
  },
  ADD_UNREAD_MESSAGE({ commit }, message) {
    commit("SET_UNREAD_MESSAGE", message)
  },
  EXCLUDE_UNREAD_MESSAGE({ commit }, room_id) {
    commit("REMOVE_UNREAD_MESSAGE", room_id)
  },
  UPDATE_NEW_ROOM({ commit }, room) {
    commit("SET_NEW_ROOM", room)
  },
  UPDATE_ONLINE_ROOM({ commit }, data) {
    commit("SET_ONLINE_ROOM", data)
  }
}

export default actions
