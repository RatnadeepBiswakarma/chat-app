<template>
  <transition name="zoomIn" appear>
    <div class="chat-window flex flex-col relative">
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
        <button @click="call" class="ml-14">
          <AppIcon
            name="phone-call"
            :attributes="{ width: 25, height: 25, fill: '#fff' }"
          />
        </button>
      </div>
      <div ref="messages" class="messages overflow-y-auto py-4">
        <Message v-for="item in allMessages" :key="item.id" :item="item" />
      </div>
      <form class="input-section flex" @submit.prevent="sendMessage">
        <textarea
          :value="message"
          ref="msgBox"
          contenteditable="true"
          spellcheck="true"
          class="input h-full w-full text-grey outline-none resize-none"
          placeholder="Enter your message"
          @input="handleMessageInput"
          @keydown.enter="handleKeydown"
        ></textarea>
        <div class="flex justify-center items-center mr-2 rounded-full">
          <button
            class="send-btn rounded-full flex justify-center items-center"
            @click="sendMessage"
          >
            <svg
              class="send-btn-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
              />
            </svg>
          </button>
        </div>
      </form>
      <div v-if="loading" class="loader"></div>
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
import { isMobile } from "@/util/platform"

export default {
  components: { Message, Back, AppIcon },
  data() {
    return {
      message: "",
      loading: false,
      stream: null,
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
      "peer",
      "getCall",
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
        differenceInDays(new Date(), parseISO(this.getOtherUser.last_online)) >
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
    if (!isMobile()) {
      this.focusInput()
    }
  },
  methods: {
    ...mapActions("chat", [
      "UPDATE_CHAT_WINDOW",
      "UPDATE_NEW_USER_DETAILS",
      "UPDATE_ROOM_MESSAGES",
      "UPDATE_READ",
      "UPDATE_PEER",
      "UPDATE_CALL",
      "UPDATE_CHAT_WINDOW"
    ]),
    call() {
      navigator.mediaDevices
        .getUserMedia({
          video: { width: { min: 1280 }, height: { min: 720 } },
          audio: true
        })
        .then(myStream => {
          const call = this.peer.call(this.getOtherUser.id, myStream, {
            metadata: {
              type: "video",
              initiator: this.getMyDetails.id,
              target_user: this.getOtherUser,
              room_id: this.getOpenWindow.id
            }
          })
          this.UPDATE_CALL(call)
          this.$nextTick(() => {
            let video = document.querySelector("#own-video")
            video.autoplay = true
            video.volume = 0
            video.muted = true
            video.srcObject = myStream
          })
          this.getCall.on("stream", remoteStream => {
            let video = document.querySelector("#video")
            video.autoplay = true
            video.volume = 0.5
            video.srcObject = remoteStream
          })
        })
    },
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
    handleMessageInput(evt) {
      this.message = evt.target.value
      if (this.getOpenWindow) {
        this.userTyping()
        debounce(this.userNoLongerTyping, 500)
      }
      this.adjustHeight()
    },
    adjustHeight() {
      const el = this.$refs.msgBox
      el.style.height = "1px"
      if (!this.message) {
        el.value = ""
        el.style.height = 0
      } else {
        el.style.height = `${el.scrollHeight}px`
        el.scrollTop = el.scrollHeight
      }
    },
    handleKeydown(evt) {
      if (!evt.shiftKey) {
        evt.preventDefault()
        this.sendMessage()
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
      this.focusInput()
      // send message
      const payload = {
        text: this.message.trim(),
        sender_id: this.getMyDetails.id
      }
      if (this.getOpenWindow) {
        payload.target_id = this.getOtherUser.id
        payload.room_id = this.getOpenWindow.id
      } else {
        payload.target_id = this.getNewUser.id
      }
      if (this.getOtherUser.email === "sage@chatapp.com") {
        payload.sage = true
      }
      this.emitSocketEvent("new_message", payload)
      this.message = ""
      this.adjustHeight()
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
      this.loading = true
      getMessages(this.getOpenWindow.id)
        .then(res => {
          this.UPDATE_ROOM_MESSAGES({
            room_id: this.getOpenWindow.id,
            messages: res.data.items
          })
          this.loading = false
          this.markMessagesAsRead()
        })
        .catch(err => {
          console.log(err)
          this.loading = false
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
  border-top: 1px solid var(--message-input-border-top-color);
}

.input {
  background: var(--message-input-bg-color);
  color: var(--message-input-color);
  min-height: 2.125rem;
  height: 2.125rem;
  max-height: 115px;
  overflow-y: auto;
  border-radius: 10px;
  padding: 0.3rem 0.7rem;
  margin: 0.5rem;
}

.input::placeholder {
  color: var(--message-input-placeholder-color);
}

.send-btn {
  width: 2.125rem;
  height: 2.125rem;
  background: var(--message-input-bg-color);
}

.send-btn-icon {
  width: 50%;
  height: 50%;
  transform: rotate(90deg);
}
</style>
