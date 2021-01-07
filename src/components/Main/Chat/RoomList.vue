<template>
  <div class="relative min-h-screen max-h-screen w-full room-list-container">
    <div class="header flex items-center">
      <div class="name text-xl text-white pl-12">
        All Chats
      </div>
    </div>
    <div
      v-for="room in getAllRooms"
      :key="room.id"
      @click="chatWith(room)"
      class="room-list-item flex items-center p-2 bg-white cursor-pointer"
    >
      <div
        class="room-pic mr-4 ml-2"
        :style="`color: ${generateRandomColor()}`"
      >
        <AppIcon name="user" :attributes="profilePicAttributes" />
      </div>
      <div class="w-4/5 h-full">
        <div class="user-name flex truncate">
          {{ getRoomName(room.users) }}
        </div>
        <div class="flex justify-between w-full">
          <small
            class="truncate w-4/5 leading-none"
            :class="
              unreads(room.id) === 0
                ? 'user-list-last-message'
                : 'user-list-last-message-unread'
            "
            >{{ getSubText(room) }}</small
          >
          <span
            v-if="unreads(room.id) > 0"
            class="unread-count text-white rounded-full text-sm flex items-center justify-center mr-4"
          >
            {{ unreads(room.id) }}
          </span>
          <span
            v-else-if="room.last_message"
            class="user-list-last-message-time leading-none"
          >
            {{ getLastMessageTime(room.last_message.created_at) }}
          </span>
        </div>
      </div>
    </div>
    <router-link
      to="/new"
      class="search-user flex justify-center items-center shadow-lg"
      ><AppIcon name="add-user" :attributes="iconAttributes" />
    </router-link>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex"
import AppIcon from "@/components/Shared/AppIcon"
import { format, parseISO, differenceInDays } from "date-fns"

export default {
  components: { AppIcon },
  computed: {
    ...mapGetters("auth", ["getMyDetails"]),
    ...mapGetters("chat", [
      "getAllRooms",
      "getUnreadCounts",
      "getLatestMessages",
    ]),
    iconAttributes() {
      return { width: 20, height: 20, fill: "#fff" }
    },
    profilePicAttributes() {
      return { width: 40, height: 40 }
    },
  },
  methods: {
    ...mapActions("chat", ["UPDATE_CHAT_WINDOW", "EXCLUDE_UNREAD_MESSAGE"]),
    generateRandomColor() {
      return `#${Math.floor(Math.random() * 16777215).toString(16)}`
    },
    getRoomName(users) {
      const user = users.find(item => item.id !== this.getMyDetails.id)
      return `${user.first_name} ${user.last_name}`
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
    getSubText(room) {
      if (this.getLatestMessages && this.getLatestMessages[room.id]) {
        return this.getLatestMessages[room.id].text
      } else if (room.last_message) {
        return `${room.last_message.text}`
      }
      return ""
    },
    getLastMessageTime(date) {
      if (differenceInDays(parseISO(date), new Date()) > 1) {
        return format(parseISO(date), "dd/MM/yy")
      }
      return format(parseISO(date), "HH:mm")
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
  border-radius: 100px;
  flex-shrink: 0;
}

.unread-count {
  min-width: 1.1rem;
  height: 1.1rem;
  background-color: var(--last-message-on-room-list-unread);
  padding: 4px;
}

.user-list-last-message-unread {
  color: var(--last-message-on-room-list-unread);
  font-weight: 500;
  font-size: 0.9rem;
}

.user-list-last-message {
  color: var(--last-message-seen-on-room-list);
  font-weight: normal;
  font-size: 0.9rem;
}

.user-list-last-message-time {
  font-size: 0.8rem;
  color: var(--last-message-seen-on-room-list-time);
}

.user-list-last-message-seen {
  color: var(--last-message-seen-on-room-list);
  font-style: italic;
}

.search-user {
  width: 3rem;
  height: 3rem;
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  border-radius: 100px;
  background-color: var(--header-bg-color);
}
</style>
