<template>
  <div class="chat-window-container w-full">
    <ChatWindow />
  </div>
</template>

<script>
import ChatWindow from "@/components/Main/Chat/ChatWindow"

export default {
  components: { ChatWindow }
}
</script>

<style scoped>
.chat-window-container {
  background: var(--chat-window-background);
}
</style>
