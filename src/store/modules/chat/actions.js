import { getRooms } from "@/apis/room"
import { getMessages } from "@/apis/messages"

const actions = {
  UPDATE_SOCKET({ commit }, socket) {
    commit("SET_SOCKET", socket)
  },
  FETCH_ROOM_MESSAGES({ commit, state }, room_id) {
    getMessages(room_id)
      .then(res => {
        commit("SET_ROOM_MESSAGE", {
          room_id,
          messages: res.data.items,
        })
        console.log(state)
      })
      .catch(err => {
        console.log(err)
      })
  },
  UPDATE_ALL_ROOMS({ commit }) {
    getRooms()
      .then(res => {
        commit("SET_ALL_ROOMS", res.data.rooms)
      })
      .catch(err => {
        console.log(err)
      })
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
}

export default actions
