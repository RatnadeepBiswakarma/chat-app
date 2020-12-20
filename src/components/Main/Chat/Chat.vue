<template>
  <div>
    <div class="messages overflow-y-auto py-4">
      <div v-for="item in messages" :key="item.id">
        <Message :item="item" />
      </div>
    </div>
    <form class="input-section flex">
      <textarea
        class="input h-full w-full text-grey p-2 border"
        placeholder="Enter your message"
      ></textarea>
      <input type="submit" value=">" class="send-btn" />
    </form>
  </div>
</template>

<script>
import { getMessages } from "@/apis/messages"
import Message from "@/components/Main/Chat/Message"

export default {
  components: { Message },
  data() {
    return {
      messages: [],
    }
  },
  created() {
    getMessages()
      .then(res => {
        this.messages = res.data.messages
      })
      .catch(err => {
        console.log(err)
      })
  },
  methods: {},
}
</script>

<style scoped>
.messages {
  height: calc(100vh - 3rem);
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
