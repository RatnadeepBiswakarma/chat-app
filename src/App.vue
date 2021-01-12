<template>
  <div class="relative overflow-x-hidden chat-app">
    <transition name="zoomOut" appear>
      <RoomList
        v-if="isLoggedIn"
        class="bg-white"
        :class="{ zoomOut: focused }"
      />
    </transition>
    <router-view @setup="setup"> </router-view>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex"
import RoomList from "@/components/Main/Chat/RoomList"
import socketConnect from "socket.io-client"
import { validateUserToken } from "@/apis/auth"

export default {
  components: { RoomList },
  created() {
    if (localStorage.token) {
      this.setup()
    }
  },
  mounted() {
    if (localStorage.token) {
      this.$router.replace("/")
    } else {
      this.$router.replace({ name: "LoginPage" })
    }
    window.onblur = () => this.updateUserActiveStatus(false)
    window.onfocus = () => this.updateUserActiveStatus(true)
  },
  computed: {
    ...mapGetters("chat", ["socket", "getOpenWindow"]),
    ...mapGetters("auth", ["getMyDetails", "isLoggedIn"]),
    focused() {
      return this.$route.path === "/"
    }
  },
  methods: {
    ...mapActions("chat", [
      "UPDATE_ALL_ROOMS",
      "UPDATE_SOCKET",
      "INCLUDE_TYPING_ROOM",
      "EXCLUDE_TYPING_ROOM",
      "UPDATE_NEW_MESSAGE",
      "ADD_UNREAD_MESSAGE",
      "UPDATE_READ",
      "UPDATE_DELIVERED",
      "UPDATE_CHAT_WINDOW",
      "UPDATE_ONLINE_ROOM",
      "UPDATE_NEW_ROOM"
    ]),
    ...mapActions("auth", ["UPDATE_MY_DETAILS"]),
    ...mapActions("user", ["UPDATE_USER_ACTIVE_STATE"]),
    setup() {
      validateUserToken()
        .then(res => {
          this.UPDATE_MY_DETAILS(res.data.user)
          const socket = socketConnect("http://localhost:5050/", {
            auth: { userId: this.getMyDetails.id },
            transports: ["websocket"]
          })
          this.UPDATE_SOCKET(socket)
          this.bindSocketEvents()
          this.UPDATE_ALL_ROOMS()
          this.socket.on("connect", () => this.updateUserActiveStatus(true))
        })
        .catch(err => {
          console.error(err)
        })
    },
    bindSocketEvents() {
      this.socket.on("room_created", this.handleNewRoomCreated)
      this.socket.on("new_message", this.handleNewMessage)
      this.socket.on("typing", this.handleTypingEvent)
      this.socket.on("no_longer_typing", this.removeTyping)
      this.socket.on("read_updated", this.handleMessageRead)
      this.socket.on("message_delivered", this.handleMessageDeliver)
      this.socket.on("all_messages_delivered", this.handleAllMessagesDelivery)
      this.socket.on("user_online_status", this.handleOtherUserOnlineStatus)
    },
    updateUserActiveStatus(status) {
      this.UPDATE_USER_ACTIVE_STATE(status)
      if (this.socket) {
        this.socket.emit("user_online_status", {
          status,
          user_id: this.getMyDetails.id
        })
      }
    },
    handleOtherUserOnlineStatus(data) {
      this.UPDATE_ONLINE_ROOM(data)
    },
    handleNewRoomCreated(room) {
      this.UPDATE_NEW_ROOM(room)
      // open the chat window if this user started the chat
      if (room.creator_id === this.getMyDetails.id) {
        this.UPDATE_CHAT_WINDOW(room)
        this.$router.push({ name: "Chat", params: { roomId: room.id } })
      }
    },
    handleNewMessage(message) {
      if (message.sender_id !== this.getMyDetails.id) {
        // update other users with message delivery
        this.messageReceived(message)
      }
      if (this.getOpenWindow && this.getOpenWindow.id === message.room_id) {
        this.UPDATE_NEW_MESSAGE(message)
        // do not mark own message as read
        if (message.sender_id !== this.getMyDetails.id) {
          this.emitRead(this.getOpenWindow.id, message.sender_id)
        }
      } else {
        this.ADD_UNREAD_MESSAGE(message)
      }
    },
    messageReceived(message) {
      this.socket.emit("message_received", message)
    },
    handleMessageDeliver(message) {
      this.UPDATE_DELIVERED(message.room_id)
    },
    handleAllMessagesDelivery(data) {
      this.UPDATE_DELIVERED(data.room_id)
    },
    emitRead(room_id, sender_id) {
      this.socket.emit("read_message", {
        room_id,
        sender_id
      })
    },
    handleMessageRead(data) {
      this.UPDATE_READ(data.room_id)
    },
    handleTypingEvent(data) {
      this.INCLUDE_TYPING_ROOM(data.room_id)
    },
    removeTyping(data) {
      this.EXCLUDE_TYPING_ROOM(data.room_id)
    }
  }
}
</script>
