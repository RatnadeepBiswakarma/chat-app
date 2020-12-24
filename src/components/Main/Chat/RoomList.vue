<template>
  <div>
    <div
      v-for="room in getAllRooms"
      :key="room.id"
      @click="chatWith(room)"
      class="room-list-item flex items-center p-2 bg-white"
    >
      <div
        class="room-pic font-bold"
        :style="`color: ${generateRandomColor()}`"
      >
        {{ getRoomPic(getRoomName(room.users)) }}
      </div>
      <div class="room-name">
        {{ getRoomName(room.users) }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex"

export default {
  computed: {
    ...mapGetters("chat", ["getAllRooms"]),
  },
  methods: {
    ...mapActions("chat", ["UPDATE_CHAT_WINDOW"]),
    generateRandomColor() {
      return `#${Math.floor(Math.random() * 16777215).toString(16)}`
    },
    getRoomName(users) {
      const user = users.find(item => item.id !== localStorage.userId)
      return `${user.first_name} ${user.last_name}`
    },
    getRoomPic(name) {
      return `${name.slice(0, 1)}`.toUpperCase()
    },
    chatWith(room) {
      this.UPDATE_CHAT_WINDOW(room)
      this.$router.push({ name: "Chat", params: { roomId: room.id } })
    },
  },
}
</script>

<style scoped>
.room-list-item {
  border-bottom: 1px solid silver;
}

.room-pic {
  width: 2.5rem;
  height: 2.5rem;
  font-size: 1.7rem;
  text-align: center;
  /* box-shadow: 0 2px 3px 0 black; */
  border-radius: 100px;
}
</style>
