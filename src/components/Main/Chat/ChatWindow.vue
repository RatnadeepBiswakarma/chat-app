<template>
  <transition name="zoomIn" appear>
    <div class="chat-window flex flex-col relative">
      <div class="header flex justify-between">
        <div class="flex items-center">
          <button
            class="back-button text-white leading-none px-2 h-full"
            @click="goBack"
          >
            <ion-icon name="arrow-back"></ion-icon>
          </button>
          <div class="user-pic">
            <AppIcon name="user" :attributes="prifilePicAttributes" />
          </div>
          <div
            class="name text-base text-white ml-2 flex flex-col leading-tight truncate"
          >
            {{ getFullName }}
            <small
              v-if="subText"
              class="text-xs font-normal scale-up"
              :class="{ 'typing-text': isTyping || isOnline }"
              >{{ subText }}</small
            >
          </div>
        </div>
        <div class="buttons flex items-center justify-center">
          <button @click="call(true)" class="call-btn">
            <ion-icon name="videocam"></ion-icon>
          </button>
          <button @click="call(false)" class="call-btn">
            <ion-icon name="call"></ion-icon>
          </button>
        </div>
      </div>
      <div ref="messages" class="messages overflow-y-auto py-4">
        <div class="text-center mb-4">
          <button
            v-if="!allLoaded"
            class="load-more-button rounded-full px-4 py-1"
            @click="loadMoreMessages"
          >
            {{ loading ? "Loading..." : "Load More" }}
          </button>
        </div>
        <div v-for="(messages, day) of messagesByDate" :key="day">
          <div class="flex justify-center items-center sticky top-0 z-10">
            <span class="day-indicator">
              {{ day }}
            </span>
          </div>
          <Message
            v-for="item in messages"
            :key="item.id"
            :item="item"
            :id="`id-${item.id}`"
            class="fadeIn"
          />
        </div>
      </div>
      <form
        class="input-section flex justify-center items-center"
        @submit.prevent="sendMessage"
      >
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
        <button
          class="flex justify-center items-center mr-2 rounded-full send-btn"
          style="padding-left:3px"
          @click="sendMessage"
        >
          <ion-icon name="send"></ion-icon>
        </button>
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
import AppIcon from "@/components/Shared/AppIcon"
import {
  format,
  parseISO,
  differenceInDays,
  isToday,
  isYesterday
} from "date-fns"
import { isMobile } from "@/util/platform"

export default {
  components: { Message, AppIcon },
  data() {
    return {
      message: "",
      loading: false,
      stream: null,
      timerId: null,
      skip: 0,
      limit: 40,
      topMessageId: null,
      initialHeight: null,
      allLoaded: false
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
    messagesByDate() {
      let msgObj = {}
      this.allMessages.forEach(msg => {
        const dateKey = this.getDateOrDay(new Date(msg.created_at))
        if (msgObj[dateKey]) {
          msgObj[dateKey].push(msg)
        } else {
          msgObj[dateKey] = [msg]
        }
      })
      return msgObj
    },
    isSage() {
      return this.getOtherUser.email === "sage@chatapp.com"
    },
    subText() {
      if (this.isSage) {
        return null
      }
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
    this.fetchMessages()
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
        this.skip = 0
        this.topMessageId = null
        this.initialHeight = null
        this.allLoaded = false
        this.fetchMessages()
      }
    }
  },
  mounted() {
    this.scrollToBottom()
    if (this.allMessages.length > 0) {
      this.skip = this.allMessages.length
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
      "UPDATE_MY_MEDIA_STREAM",
      "UPDATE_CALL_CONNECTION_STATUS",
      "UPDATE_CHAT_WINDOW"
    ]),
    getDateOrDay(date) {
      return isToday(date)
        ? "Today"
        : isYesterday(date)
        ? "Yesterday"
        : date.toLocaleDateString()
    },
    async loadMoreMessages() {
      if (this.allMessages.length > 0) {
        this.topMessageId = this.allMessages[0].id
      }
      this.skip = this.skip + this.limit
      this.initialHeight = this.$refs.messages.scrollHeight
      await this.fetchMessages(true)
    },
    call(video = false) {
      navigator.mediaDevices
        .getUserMedia({
          video,
          audio: true
        })
        .then(myStream => {
          this.UPDATE_MY_MEDIA_STREAM(myStream)
          const call = this.peer.call(this.getOtherUser.id, myStream, {
            metadata: {
              video: video ? true : false,
              initiator: this.getMyDetails,
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
            this.UPDATE_CALL_CONNECTION_STATUS(true)
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
    async fetchMessages(oldMessages = false) {
      this.loading = true
      try {
        const res = await getMessages(this.getOpenWindow.id, {
          skip: this.skip,
          limit: this.limit
        })
        this.UPDATE_ROOM_MESSAGES({
          room_id: this.getOpenWindow.id,
          oldMessages,
          messages: res.data.items
        })
        this.loading = false
        this.markMessagesAsRead()
        if (res.data.items.length < this.limit) {
          this.allLoaded = true
        }
        this.$nextTick(() => {
          if (oldMessages && this.topMessageId) {
            /* keep scroll position */
            this.$refs.messages.scrollTop =
              this.$refs.messages.scrollHeight - this.initialHeight
          }
        })
      } catch (err) {
        console.log(err)
        this.loading = false
      }
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
  flex-shrink: 0;
  background: var(--message-input-bg-color);
}

.send-btn ion-icon {
  width: 60%;
}

.buttons {
  margin-right: 3rem;
}

.call-btn {
  width: 4rem;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.call-btn ion-icon {
  height: 1.8rem;
}

.load-more-button {
  background: var(--search-user-background);
  min-width: 7.5rem;
  text-align: center;
}

.day-indicator {
  background: var(--day-indicator-background);
  border-radius: 3px;
  padding: 0.1rem 0.4rem;
  color: var(--day-indicator-color);
  font-size: 0.9rem;
}

@media screen and (max-width: 640px) {
  .buttons {
    margin-right: 0.5rem;
  }

  .call-btn {
    width: 3rem;
    height: 100%;
  }
  .name {
    max-width: 8.5rem;
  }
}
</style>
