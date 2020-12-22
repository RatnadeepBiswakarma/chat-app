<template>
  <div>
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
      />
      <input type="submit" value=">" class="send-btn" />
    </form>
  </div>
</template>

<script>
import Message from "@/components/Main/Chat/Message"
import { getMessages } from "@/apis/messages"

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
  },
  data() {
    return {
      message: "",
      messages: [],
    }
  },
  created() {
    if (this.room) {
      getMessages(this.room.id)
        .then(res => {
          // console.log(res.data.messages)
          this.messages = res.data.items
          this.scrollToBottom()
        })
        .catch(err => {
          console.log(err)
        })
    }

    this.socket.on("room_created", room => {
      console.log("newly created room", room)
      this.$emit("new-room-created", room)
    })
    this.socket.on("new_message", message => {
      console.log("new message", message)
      this.messages.push(message)
      this.scrollToBottom()
    })
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
    sendMessage() {
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
  },
}
</script>

<style scoped>
.header {
  height: 3rem;
  background-color: var(--header-bg-color);
  box-shadow: 0 2px 10px 0 #2c2c2c;
  z-index: 1;
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
