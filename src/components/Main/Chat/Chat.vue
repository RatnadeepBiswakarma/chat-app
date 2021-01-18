<template>
  <div class="chat-window-container w-full h-full">
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
  background: var(--messages-background);
}
</style>
