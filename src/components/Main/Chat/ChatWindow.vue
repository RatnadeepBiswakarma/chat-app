<template>
  <transition name="zoomIn" appear>
    <div class="">
      <div class="header flex items-center">
        <button
          class="back-button text-white leading-none pl-4 px-2 h-full"
          @click="goBack"
        >
          <Back class="back-arrow" />
        </button>
        <div class="user-pic">
          <AppIcon name="user" :attributes="prifilePicAttributes" />
        </div>
        <div class="name text-base text-white ml-2 flex flex-col leading-tight">
          {{ getFullName }}
          <small
            v-if="subText"
            class="text-xs font-normal scale-up"
            :class="{ 'typing-text': isTyping || isOnline }"
            >{{ subText }}</small
          >
        </div>
      </div>
      <div ref="messages" class="messages overflow-y-auto py-4">
        <div v-for="item in allMessages" :key="item.id">
          <Message :item="item" />
        </div>
      </div>
      <form class="input-section flex" @submit.prevent="sendMessage">
        <input
          ref="msgBox"
          type="text"
          v-model="message"
          class="input h-full w-full text-grey p-2 outline-none"
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
import { getMessages, patchRead } from "@/apis/messages"
import Back from "@/components/Shared/Back"
import AppIcon from "@/components/Shared/AppIcon"
import { format, parseISO, differenceInDays } from "date-fns"

export default {
  components: { Message, Back, AppIcon },
  data() {
    return {
      message: "",
      timerId: null
    }
  },
  computed: {
    ...mapGetters("chat", [
      "getTypingUsers",
      "getOpenWindow",
      "getNewUser",
      "allMessages",
      "socket",
      "getOnlineRooms",
      "getLastMessage"
    ]),
    ...mapGetters("auth", ["getMyDetails"]),
    subText() {
      if (this.isTyping) {
        return "typing..."
      }
      if (this.isOnline) {
        return "online"
      }
      if (this.getLastOnlinetime) {
        return `Last online ${this.getLastOnlinetime}`
      }
      return ""
    },
    isOnline() {
      if (this.getOpenWindow) {
        return this.getOnlineRooms[this.getOpenWindow.id]
      }
      return false
    },
    getLastOnlinetime() {
      if (!this.getOtherUser || !this.getOtherUser.last_online) {
        return ""
      }
      if (
        differenceInDays(parseISO(this.getOtherUser.last_online), new Date()) >
        1
      ) {
        return format(parseISO(this.getOtherUser.last_online), "dd/MM/yy")
      }
      return format(parseISO(this.getOtherUser.last_online), "HH:mm")
    },
    prifilePicAttributes() {
      return { width: 32, height: 32 }
    },
    messages() {
      if (this.getOpenWindow) {
        return this.allMessages[this.getOpenWindow.id]
      }
      return []
    },
    getOtherUser() {
      if (this.getOpenWindow) {
        let user = this.getOpenWindow.users.find(
          user => user.id !== this.getMyDetails.id
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
      if (this.getNewUser) {
        return `${this.getNewUser.first_name} ${this.getNewUser.last_name}`
      }
      return "New Chat"
    },
    isTyping() {
      return (
        this.getOpenWindow &&
        this.getTypingUsers.includes(this.getOpenWindow.id)
      )
    }
  },
  created() {
    if (!this.getOpenWindow && !this.getNewUser) {
      this.$router.replace({ name: "Home" })
      return
    }
    if (this.getNewUser) {
      //
    } else if (this.allMessages.length === 0) {
      this.fetchMessages()
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
    $route(nextRoute) {
      if (nextRoute.name === "Chat") {
        this.fetchMessages()
      }
    }
  },
  mounted() {
    this.scrollToBottom()
    if (this.allMessages.length > 0) {
      this.updateReadToSocket()
    }
    this.focusInput()
  },
  methods: {
    ...mapActions("chat", [
      "UPDATE_CHAT_WINDOW",
      "UPDATE_NEW_USER_DETAILS",
      "UPDATE_ROOM_MESSAGES",
      "UPDATE_READ",
      "UPDATE_CHAT_WINDOW"
    ]),
    focusInput() {
      if (this.$refs.msgBox) {
        this.$refs.msgBox.focus()
      }
    },
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
        sender_id: this.getMyDetails.id
      }
      if (this.getOpenWindow) {
        payload.target_id = this.getOtherUser.id
        payload.room_id = this.getOpenWindow.id
      } else {
        payload.target_id = this.getNewUser.id
      }
      this.emitSocketEvent("new_message", payload)
      this.message = ""
    },
    goBack() {
      this.$router.replace({ name: "Home" })
      this.UPDATE_CHAT_WINDOW(null)
    },
    userTyping() {
      if (this.getOpenWindow) {
        this.emitSocketEvent("typing", {
          room_id: this.getOpenWindow.id,
          sender_id: this.getMyDetails.id
        })
      }
    },
    userNoLongerTyping() {
      if (this.getOpenWindow) {
        this.emitSocketEvent("no_longer_typing", {
          room_id: this.getOpenWindow.id,
          sender_id: this.getMyDetails.id
        })
      }
    },
    emitSocketEvent(evt, payload) {
      this.socket.emit(evt, payload)
    },
    markMessagesAsRead() {
      const payload = {
        sender_id: this.getOtherUser.id
      }
      patchRead(this.getOpenWindow.id, payload)
        .then(() => {
          // do nothing
        })
        .catch(err => console.error(err))
      this.updateReadToSocket()
    },
    updateReadToSocket() {
      this.socket.emit("read_message", {
        room_id: this.getOpenWindow.id,
        sender_id: this.getOtherUser.id
      })
    },
    fetchMessages() {
      getMessages(this.getOpenWindow.id)
        .then(res => {
          this.UPDATE_ROOM_MESSAGES({
            room_id: this.getOpenWindow.id,
            messages: res.data.items
          })
          this.markMessagesAsRead()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }
}
</script>

<style scoped>
.back-button {
  position: relative;
}

.back-arrow {
  width: 1.3rem;
  fill: white;
}

.user-pic {
  width: 2rem;
  height: 2rem;
  border-radius: 100px;
  flex-shrink: 0;
}

.name {
  font-weight: 500;
}

.typing-text {
  color: var(--typing-text-color);
}

.header {
  z-index: 1;
}

.input-section {
  height: 3rem;
  border-top: 1px solid var(--message-input-border-top-color);
}

.input {
  background: var(--message-input-bg-color);
  color: var(--message-input-color);
}

.input::placeholder {
  color: var(--message-input-placeholder-color);
}

.send-btn {
  width: 3rem;
  background: var(--message-input-bg-color);
}
</style>
