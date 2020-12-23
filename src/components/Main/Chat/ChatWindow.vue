<template>
  <transition name="zoomIn" appear>
    <div>
      <div class="header flex items-center">
        <button
          class="back-button text-white leading-none ml-2 px-2"
          @click="goBack"
        >
          Back
        </button>
        <div class="name text-xl text-white ml-4">
          {{ getFullName }}
          <small class="text-green">{{ isTyping ? "typing..." : "" }}</small>
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
          @input="handleMessageInput"
        />
        <input type="submit" value="➤" class="send-btn" />
      </form>
    </div>
  </transition>
</template>

<script>
import Message from "@/components/Main/Chat/Message"
import { getMessages } from "@/apis/messages"
import debounce from "@/util/debouncer"

export default {
  components: { Message },
  props: {
    room: {
      type: Object,
      required: false,
    },
    newUser: {
      type: Object,
      required: false,
    },
    socket: {
      type: Object,
      required: true,
    },
    typingInRooms: {
      type: Array,
      required: false,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      message: "",
      messages: [],
      timerId: null,
    }
  },
  computed: {
    getOtherUser() {
      if (this.room) {
        let user = this.room.users.find(user => user.id !== localStorage.userId)
        if (user) {
          return user
        }
        return {}
      }
      return {}
    },
    getFullName() {
      if (this.getOtherUser.first_name) {
        return `${this.getOtherUser.first_name} ${this.getOtherUser.last_name}`
      }
      return "New Chat"
    },
    isTyping() {
      return this.room && this.typingInRooms.includes(this.room.id)
    },
  },
  created() {
    if (this.room) {
      getMessages(this.room.id)
        .then(res => {
          this.messages = res.data.items
          this.scrollToBottom()
        })
        .catch(err => {
          console.log(err)
        })
    }

    this.socket.on("room_created", this.handleNewRoomCreated)
    this.socket.on("new_message", this.handleNewMessage)
  },
  beforeUnmount() {
    if (this.socket) {
      this.socket.off("new_message", this.handleNewMessage)
      this.socket.off("room_created", this.handleNewRoomCreated)
    }
  },
  mounted() {
    this.scrollToBottom()
  },
  methods: {
    scrollToBottom() {
      this.$nextTick(() => {
        this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight
      })
    },
    handleMessageInput() {
      if (this.room) {
        this.userTyping(), 400
        debounce(this.userNoLongerTyping, 500)
      }
    },
    handleNewMessage(message) {
      if (this.room && message.room_id === this.room.id) {
        this.messages.push(message)
        this.scrollToBottom()
      }
    },
    handleNewRoomCreated(room) {
      this.$emit("new-room-created", room)
    },
    sendMessage() {
      this.userNoLongerTyping()
      // send message
      const payload = {
        text: this.message,
        sender_id: localStorage.userId,
      }
      if (this.room) {
        payload.room_id = this.room.id
      } else {
        payload.target_id = this.newUser.id
      }
      this.$emit("send-message", payload)
      this.message = ""
    },
    goBack() {
      this.$emit("go-back")
    },
    userTyping() {
      if (this.room) {
        this.socket.emit("typing", {
          room_id: this.room.id,
          sender_id: localStorage.userId,
        })
      }
    },
    userNoLongerTyping() {
      if (this.room) {
        this.socket.emit("no_longer_typing", {
          room_id: this.room.id,
          sender_id: localStorage.userId,
        })
      }
    },
  },
}
</script>

<style scoped>
.back-button {
  /* width: 2rem; */
  position: relative;
}

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
