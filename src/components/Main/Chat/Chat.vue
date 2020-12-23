<template>
  <div>
    <div v-if="chatWithRoom || newSelectedUser">
      <ChatWindow
        v-if="chatWithRoom"
        :room="chatWithRoom"
        @send-message="sendMessage"
        @new-room-created="handleNewRoomCreation"
        @go-back="goBack"
      />
      <ChatWindow
        v-if="newSelectedUser"
        :newUser="newSelectedUser"
        @send-message="sendMessage"
        @new-room-created="handleNewRoomCreation"
        @go-back="goBack"
      />
    </div>
    <transition v-else name="zoomOut" appear>
      <div>
        <div class="header flex items-center">
          <div class="name text-xl text-white ml-4">
            All Chats
          </div>
        </div>
        <RoomList :rooms="rooms" @chat-with="chatWith" class="py-4 bg-white" />
      </div>
    </transition>

    <div>
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
    </div>
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
import RoomList from "@/components/Main/Chat/RoomList"
import ChatWindow from "@/components/Main/Chat/ChatWindow"
// import Message from "@/components/Main/Chat/Message"
import { getRooms, getUser } from "@/apis/room"
import socketConnect from "socket.io-client"
import debounce from "@/util/debouncer"
import { mapActions, mapGetters } from "vuex"

export default {
  components: { RoomList, ChatWindow },
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
    ...mapGetters("chat", ["getTypingUsers", "getSocket"]),
  },
  created() {
    getRooms()
      .then(res => {
        this.rooms = res.data.rooms
        // this.scrollToBottom()
      })
      .catch(err => {
        console.log(err)
      })

    const socket = socketConnect("http://localhost:5050/", {
      auth: { userId: localStorage.userId },
    })

    this.UPDATE_SOCKET(socket)
    this.getSocket.on("typing", this.handleTypingEvent)
    this.getSocket.on("no_longer_typing", this.removeTyping)
  },
  mounted() {
    // this.$nextTick(() => {
    this.scrollToBottom()
    // })
  },
  methods: {
    ...mapActions("chat", [
      "INCLUDE_TYPING_ROOM",
      "EXCLUDE_TYPING_ROOM",
      "UPDATE_SOCKET",
    ]),
    chatWith(room) {
      this.chatWithRoom = room
    },
    handleNewRoomCreation(room) {
      this.chatWithRoom = room
      this.newSelectedUser = null
    },
    startWithNewUser() {
      this.newSelectedUser = this.newUser
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
    goBack() {
      this.chatWithRoom = null
    },
    scrollToBottom() {
      this.$nextTick(() => {
        // this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight
      })
    },
    sendMessage(payload) {
      this.getSocket.emit("new_message", payload)
    },
  },
}
</script>

<style scoped>
.header {
  height: 3rem;
  background-color: var(--header-bg-color);
  box-shadow: 0 2px 10px 0 #2c2c2c;
  z-index: 1;
  position: sticky;
  top: 0;
}

.messages {
  height: calc(100vh - 3rem - 3rem);
  transform: translateZ(0);
  will-change: transform;
}

.input-section {
  height: 3rem;
}

.send-btn {
  width: 3rem;
}
</style>
