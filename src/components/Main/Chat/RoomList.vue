<template>
  <div>
    <div class="header flex items-center">
      <div class="name text-xl text-white pl-12">
        All Chats
      </div>
    </div>
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
      <div class="w-full h-full">
        <div class="user-name flex">
          {{ getRoomName(room.users) }}
        </div>
        <div class="flex justify-between w-full">
          <small class="user-list-last-message truncate w-4/5">{{
            getSubText(room.id)
          }}</small>
          <span
            v-if="unreads(room.id) > 0"
            class="unread-count text-white rounded-full text-sm flex items-center justify-center mr-4"
          >
            {{ unreads(room.id) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex"

export default {
  computed: {
    ...mapGetters("chat", [
      "getAllRooms",
      "getUnreadCounts",
      "getLatestMessages",
    ]),
  },
  methods: {
    ...mapActions("chat", ["UPDATE_CHAT_WINDOW", "EXCLUDE_UNREAD_MESSAGE"]),
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
      this.EXCLUDE_UNREAD_MESSAGE(room.id)
    },
    unreads(room_id) {
      let room = this.getUnreadCounts.find(item => item.room_id === room_id)
      if (room) {
        return room.count
      }
      return 0
    },
    getSubText(room_id) {
      if (this.getLatestMessages && this.getLatestMessages[room_id]) {
        return this.getLatestMessages[room_id].text
      }
      return ""
    },
  },
}
</script>

<style scoped>
.room-list-item {
  border-bottom: 1px solid silver;
}

.user-name {
  color: var(--user-name-on-room-list);
  font-weight: 500;
}

.room-pic {
  width: 2.5rem;
  height: 2.5rem;
  font-size: 1.7rem;
  text-align: center;
  /* box-shadow: 0 2px 3px 0 black; */
  border-radius: 100px;
  flex-shrink: 0;
}

.unread-count {
  min-width: 1.3rem;
  height: 1.3rem;
  background-color: var(--last-message-on-room-list);
  padding: 4px;
}

.user-list-last-message {
  color: var(--last-message-on-room-list);
  font-weight: 500;
  font-size: 0.9rem;
}

.user-list-last-message-seen {
  color: var(--last-message-seen-on-room-list);
  font-style: italic;
}
</style>
