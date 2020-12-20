<template>
  <div
    class="flex items-start"
    :class="
      item.sent_by_me ? 'mr-4 justify-end received' : 'ml-4 justify-start sent'
    "
  >
    <div class="message-section my-1 p-1 px-2 text-white leading-tight">
      {{ item.message }}
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
  border-radius: 10px;
}

.received .message-section {
  background-color: var(--other-message-bg-color);
}

.sent .message-section {
  background-color: #d445ff;
}
</style>
