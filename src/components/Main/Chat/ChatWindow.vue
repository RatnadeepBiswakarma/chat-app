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
        <div class="name text-xl text-white">
          {{ getFullName }}
          <small class="text-green">{{ isTyping ? "typing..." : "" }}</small>
        </div>
      </div>
      <div ref="messages" class="messages overflow-y-auto py-4">
        <div v-for="item in allMessages" :key="item.id">
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
import debounce from "@/util/debouncer"
import { mapActions, mapGetters } from "vuex"
import { getMessages } from "@/apis/messages"

export default {
  components: { Message },
  data() {
    return {
      message: "",
      timerId: null,
    }
  },
  computed: {
    ...mapGetters("chat", [
      "getTypingUsers",
      "getOpenWindow",
      "getNewUser",
      "allMessages",
      "socket",
      "getLastMessage",
    ]),
    messages() {
      if (this.getOpenWindow) {
        return this.allMessages[this.getOpenWindow.id]
      }
      return []
    },
    getOtherUser() {
      if (this.getOpenWindow) {
        let user = this.getOpenWindow.users.find(
          user => user.id !== localStorage.userId
        )
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
      return (
        this.getOpenWindow &&
        this.getTypingUsers.includes(this.getOpenWindow.id)
      )
    },
  },
  created() {
    if (!this.getOpenWindow && !this.getNewUser) {
      this.$router.replace({ name: "Home" })
      return
    }
    if (this.allMessages.length === 0) {
      getMessages(this.getOpenWindow.id)
        .then(res => {
          this.UPDATE_ROOM_MESSAGES({
            room_id: this.getOpenWindow.id,
            messages: res.data.items,
          })
        })
        .catch(err => {
          console.log(err)
        })
    }
  },
  watch: {
    getLastMessage(msg) {
      if (msg.room_id === this.getOpenWindow.id) {
        this.scrollToBottom()
      }
    },
    allMessages(newList) {
      if (newList.length > 0) {
        this.scrollToBottom()
      }
    },
  },
  mounted() {
    this.scrollToBottom()
  },
  methods: {
    ...mapActions("chat", [
      "UPDATE_CHAT_WINDOW",
      "UPDATE_NEW_USER_DETAILS",
      "UPDATE_ROOM_MESSAGES",
    ]),
    scrollToBottom() {
      this.$nextTick(() => {
        this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight
      })
    },
    handleMessageInput() {
      if (this.getOpenWindow) {
        this.userTyping()
        debounce(this.userNoLongerTyping, 500)
      }
    },
    handleNewMessage(message) {
      if (this.getOpenWindow && message.room_id === this.getOpenWindow.id) {
        this.messages.push(message)
        this.scrollToBottom()
      }
    },
    handleNewRoomCreated(room) {
      this.UPDATE_CHAT_WINDOW(room)
      this.$router.replace({ name: "Chat", params: { roomId: room.id } })
    },
    sendMessage() {
      this.userNoLongerTyping()
      if (!this.message) {
        return
      }
      // send message
      const payload = {
        text: this.message,
        sender_id: localStorage.userId,
      }
      if (this.getOpenWindow) {
        payload.room_id = this.getOpenWindow.id
      } else {
        payload.target_id = this.getNewUser.id
      }
      this.emitSocketEvent("new_message", payload)
      this.message = ""
    },
    goBack() {
      this.$router.go(-1)
    },
    userTyping() {
      // if (this.getOpenWindow) {
      this.emitSocketEvent("typing", {
        room_id: this.getOpenWindow.id,
        sender_id: localStorage.userId,
      })
      // }
    },
    userNoLongerTyping() {
      if (this.getOpenWindow) {
        this.emitSocketEvent("no_longer_typing", {
          room_id: this.getOpenWindow.id,
          sender_id: localStorage.userId,
        })
      }
    },
    emitSocketEvent(evt, payload) {
      this.socket.emit(evt, payload)
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
