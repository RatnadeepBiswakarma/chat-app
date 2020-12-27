<template>
  <div class="relative">
    <transition name="zoomOut" appear>
      <RoomList class="bg-white" :class="{ zoomOut: focused }" />
    </transition>
    <router-view> </router-view>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex"
import RoomList from "@/components/Main/Chat/RoomList"
import socketConnect from "socket.io-client"

export default {
  components: { RoomList },
  created() {
    const socket = socketConnect("http://localhost:5050/", {
      auth: { userId: localStorage.userId },
    })
    this.UPDATE_SOCKET(socket)
    this.bindSocketEvents()
    this.UPDATE_ALL_ROOMS()
  },
  mounted() {
    this.$router.replace("/")
  },
  computed: {
    ...mapGetters("chat", ["socket", "getOpenWindow"]),
    focused() {
      return this.$route.path === "/"
    },
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
    ]),
    bindSocketEvents() {
      this.socket.on("room_created", this.handleNewRoomCreated)
      this.socket.on("new_message", this.handleNewMessage)
      this.socket.on("typing", this.handleTypingEvent)
      this.socket.on("no_longer_typing", this.removeTyping)
      this.socket.on("read_updated", this.handleMessageRead)
    },
    handleNewRoomCreated(room) {
      console.log(room)
    },
    handleNewMessage(message) {
      if (this.getOpenWindow && this.getOpenWindow.id === message.room_id) {
        this.UPDATE_NEW_MESSAGE(message)
        // do not mark own message as read
        if (message.sender_id !== localStorage.userId) {
          this.emitRead(this.getOpenWindow.id, message.sender_id)
        }
      } else {
        this.ADD_UNREAD_MESSAGE(message)
      }
    },
    emitRead(room_id, sender_id) {
      this.socket.emit("read_message", {
        room_id,
        sender_id,
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
    },
  },
}
</script>
<style scoped>
.zoomOut {
  animation: zoom-out 0.3s ease-out;
}
</style>
