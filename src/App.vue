<template>
  <div
    class="relative overflow-x-hidden chat-app"
    :class="{ 'full-width': loginPage }"
  >
    <transition name="zoomOut" appear>
      <RoomList
        v-if="isLoggedIn"
        class="bg-white"
        :class="focused ? 'zoomOut' : 'off-screen-mobile'"
        :notificationAllowed="notificationAllowed"
        @notification-allowed="notificationAllowed = true"
      />
    </transition>
    <router-view @setup="setup"> </router-view>
    <div
      v-if="homeRoute && isLoggedIn && !getOpenWindow && getAllRooms.length > 0"
      class="text-center w-full fadeIn empty-chat-window-placeholder"
    >
      <ion-icon
        name="chatbubbles"
        class="big-chat-icon block m-auto"
      ></ion-icon>
      <span class="text-xl font-light"
        >Chat with your friends and have fun!
      </span>
      <span class="text-sm block mt-4">
        Hey, I'm Ratnadeep. I coded this chat app. Hope you find it fun to use.
        Let's connect
      </span>
      <span class="block mt-2 flex justify-center">
        <a
          v-for="item in socialAccounts"
          :key="item.logo"
          :href="item.link"
          class="mx-2 social-link"
          target="_blank"
        >
          <ion-icon :name="item.logo"></ion-icon>
        </a>
      </span>
    </div>
    <Call v-if="getCall && Object.keys(getCall).length > 0" :call="getCall" />
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex"
import RoomList from "@/components/Main/Chat/RoomList"
import socketConnect from "socket.io-client"
import { validateUserToken } from "@/apis/auth"
import Peer from "peerjs"
import Call from "@/components/Calls/Call"
const msg_noti_audio = require("../public/msg-noti.mp3")

export default {
  components: { RoomList, Call },
  data() {
    return {
      msgAudio: null,
      notificationAllowed: false
    }
  },
  created() {
    if (localStorage.token) {
      this.setup()
    }
    this.msgAudio = new Audio(msg_noti_audio)
    this.notificationAllowed = this.$notificationAllowed()
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
    ...mapGetters("chat", [
      "socket",
      "peer",
      "getOpenWindow",
      "getCall",
      "getAllRooms"
    ]),
    ...mapGetters("auth", ["getMyDetails", "isLoggedIn"]),
    focused() {
      return this.$route.path === "/"
    },
    homeRoute() {
      return this.$route.path === "/"
    },
    socialAccounts() {
      return [
        {
          link: "https://github.com/RatnadeepBiswakarma",
          logo: "logo-github"
        },
        {
          link: "https://www.linkedin.com/in/ratnadeepbiswakarma/",
          logo: "logo-linkedin"
        },
        {
          link: "https://twitter.com/RatnadeepBiswa3",
          logo: "logo-twitter"
        }
      ]
    },
    loginPage() {
      return this.$route.name === "LoginPage"
    }
  },
  methods: {
    ...mapActions("chat", [
      "UPDATE_ALL_ROOMS",
      "UPDATE_SOCKET",
      "UPDATE_PEER",
      "UPDATE_CALL",
      "INCLUDE_TYPING_ROOM",
      "EXCLUDE_TYPING_ROOM",
      "UPDATE_NEW_MESSAGE",
      "ADD_UNREAD_MESSAGE",
      "UPDATE_READ",
      "UPDATE_DELIVERED",
      "UPDATE_CHAT_WINDOW",
      "UPDATE_ONLINE_ROOM",
      "ADD_ALL_UNREADS",
      "UPDATE_CALL_CONNECTION_STATUS",
      "UPDATE_NEW_ROOM"
    ]),
    ...mapActions("auth", ["UPDATE_MY_DETAILS"]),
    ...mapActions("user", ["UPDATE_USER_ACTIVE_STATE"]),
    setup() {
      validateUserToken()
        .then(res => {
          this.UPDATE_MY_DETAILS(res.data.user)
          const socket = socketConnect(process.env.VUE_APP_BASE_URL, {
            auth: { userId: this.getMyDetails.id },
            transports: ["websocket"]
          })
          this.UPDATE_SOCKET(socket)
          this.bindSocketEvents()
          this.UPDATE_ALL_ROOMS()
          this.socket.on("connect", () => {
            this.updateUserActiveStatus(true)
            this.socket.emit("get_unread_messages")
            const peer = new Peer(this.getMyDetails.id)
            this.UPDATE_PEER(peer)
            peer.on("call", call => {
              this.UPDATE_CALL(call)
            })
          })
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          let loader = document.querySelector(".loader")
          if (loader) {
            loader.remove()
          }
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
      this.socket.on("unread_messages", this.handleUnreadMessages)
      this.socket.on("call_disconnected", this.handleCallDisconnect)
    },
    playAudio() {
      this.msgAudio.play()
    },
    showNotification(message) {
      const title = this.getRoomName(message.room_id)
      const room = this.getRoom(message.room_id)
      const vm = this
      this.$notify(title, {
        body: message.text,
        timeout: 4000,
        onClick: function() {
          window.focus()
          if (room) {
            vm.UPDATE_CHAT_WINDOW(room)
            vm.$router.push({
              name: "Chat",
              params: { roomId: message.room_id }
            })
          }
          this.close()
        }
      })
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
      } else if (message.sender_id !== this.getMyDetails.id) {
        this.ADD_UNREAD_MESSAGE(message)
      }
      if (message.target_id === this.getMyDetails.id) {
        this.playAudio()
        if (this.$notificationAllowed()) {
          this.showNotification(message)
        }
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
    },
    handleUnreadMessages(data) {
      this.ADD_ALL_UNREADS(data.unreads)
    },
    handleCallDisconnect() {
      if (this.getCall.localStream) {
        this.getCall.localStream.getTracks().forEach(function(track) {
          track.stop()
        })
      }
      this.UPDATE_CALL_CONNECTION_STATUS(false)
      this.getCall.close()
      this.UPDATE_CALL(null)
    },
    getRoom(room_id) {
      const room = this.getAllRooms.find(r => r.id === room_id)
      if (room) {
        return room
      }
      return null
    },
    getRoomName(room_id) {
      const room = this.getAllRooms.find(r => r.id === room_id)
      if (room) {
        const otherUser = room.users.find(u => u.id !== this.getMyDetails.id)
        if (otherUser) {
          return `${otherUser.first_name} ${otherUser.last_name}`
        }
        return "New message"
      }
      return "New message"
    }
  }
}
</script>
