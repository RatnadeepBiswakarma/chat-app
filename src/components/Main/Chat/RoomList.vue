<template>
  <div>
    <div v-for="room in rooms" :key="room.id" @click="chatWith(room)">
      {{ getRoomName(room.users) }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    rooms: {
      type: Array,
      required: true,
    },
  },
  methods: {
    getRoomName(users) {
      const user = users.find(item => item.id !== localStorage.userId)
      return `${user.first_name} ${user.last_name}`
    },
    chatWith(room) {
      this.$emit("chat-with", room)
    },
  },
}
</script>

<style></style>
