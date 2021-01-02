<template>
  <div class="chat-window-container bg-white w-full h-full">
    <ChatWindow />
  </div>
</template>

<script>
import ChatWindow from "@/components/Main/Chat/ChatWindow"

export default {
  components: { ChatWindow },
}
</script>

<style scoped>
.chat-window-container {
  position: absolute;
  top: 0;
  left: 0;
}
</style>
