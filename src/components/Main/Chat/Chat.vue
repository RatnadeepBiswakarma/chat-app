<template>
  <div class="chat-window-container bg-white w-full h-full">
    <ChatWindow />

    <!-- <div>
      <div v-if="newUser">
        <div @click="startWithNewUser">
          {{ newUser.first_name }} {{ newUser.last_name }}
        </div>
      </div>
      <form
        v-if="!chatWithRoom && !newSelectedUser"
        @submit.prevent="startNewChat"
      >
        <input type="email" v-model="newUserEmail" />
        <button>Start Chat</button>
      </form>
    </div> -->
    <!-- <div v-else>
      <div class="header flex items-center">
        <div class="name text-xl text-white ml-4">
          Coder Deep
        </div>
      </div>
      <div ref="messages" class="messages overflow-y-auto py-4">
        <div v-for="item in messages" :key="item.id">
          <Message :item="item" />
        </div>
      </div>
      <form class="input-section flex" @submit.prevent="sendMessage">
        <input
          type="text"
          v-model="message"
          class="input h-full w-full text-grey p-2 border"
          placeholder="Enter your message"
          @keypress.enter="sendMessage"
        />
        <input type="submit" value=">" class="send-btn" />
      </form>
    </div> -->
  </div>
</template>

<script>
import ChatWindow from "@/components/Main/Chat/ChatWindow"
import { getUser } from "@/apis/room"
import debounce from "@/util/debouncer"
import { mapActions, mapGetters } from "vuex"

export default {
  components: { ChatWindow },
  data() {
    return {
      rooms: [],
      chatWithRoom: null,
      newUserEmail: "coder@mail.com",
      newUser: null,
      newSelectedUser: null,
    }
  },
  computed: {
    ...mapGetters("chat", ["getTypingUsers"]),
  },
  methods: {
    ...mapActions("chat", [
      "INCLUDE_TYPING_ROOM",
      "EXCLUDE_TYPING_ROOM",
      "INITIATE_SOCKET",
      "UPDATE_CHAT_WINDOW",
      "UPDATE_NEW_USER_DETAILS",
    ]),
    chatWith(room) {
      this.UPDATE_CHAT_WINDOW(room)
      // this.chatWithRoom = room
      this.$router.push({ name: "ChatWindow", params: { roomId: room.id } })
    },
    handleNewRoomCreation(room) {
      this.UPDATE_CHAT_WINDOW(room)
      this.newUser = null
    },
    startWithNewUser() {
      this.UPDATE_NEW_USER_DETAILS(this.newUser)
      // this.newSelectedUser = this.newUser
      this.newUser = null
    },
    handleTypingEvent(data) {
      if (!this.getTypingUsers.includes(data.room_id)) {
        this.INCLUDE_TYPING_ROOM(data.room_id)
      }
      debounce(this.removeTyping, 1000, data.room_id)
    },
    removeTyping(room_id) {
      this.EXCLUDE_TYPING_ROOM(room_id)
    },
    startNewChat() {
      getUser(this.newUserEmail)
        .then(res => {
          this.newUser = res.data.user
        })
        .catch(err => {
          console.log(err)
        })
    },
  },
}
</script>

<style scoped>
.chat-window-container {
  position: absolute;
  top: 0;
  left: 0;
}
</style>
