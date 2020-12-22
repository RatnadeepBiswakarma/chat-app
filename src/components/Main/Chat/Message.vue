<template>
  <div
    class="flex items-start"
    :class="
      sentByMe(item.sender_id)
        ? 'mr-4 justify-end sent'
        : 'ml-4 justify-start received'
    "
  >
    <div
      class="message-section my-1 p-1 px-2 text-white leading-tight shadow-lg"
    >
      {{ item.text }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  methods: {
    getUserName(user) {
      return `${user.first_name} ${user.last_name}`
    },
    getProfilePic(first_name) {
      return first_name.slice(0, 1)
    },
    sentByMe(senderId) {
      return senderId === localStorage.userId
    },
  },
}
</script>

<style scoped>
.profile-pic {
  width: 2.5rem;
  height: 2.5rem;
  font-size: 1.7rem;
  text-align: center;
  box-shadow: 0 2px 3px 0 black;
}

.message-section {
  width: auto;
  max-width: 70%;
}

.received .message-section {
  background-color: #3b5894;
  border-radius: 0px 10px 8px 10px;
}

.sent .message-section {
  background-color: var(--other-message-bg-color);
  border-radius: 10px 0px 10px 8px;
}
</style>
