<template>
  <div class="relative w-full room-list-container">
    <div class="header flex items-center justify-between">
      <div class="name text-xl text-white pl-6">
        All Chats
      </div>
      <div class="flex items-center justify-center relative">
        <router-link
          to="/new"
          class="search-user-header flex justify-center items-center mr-4 p-2"
          ><ion-icon name="person-add"></ion-icon>
        </router-link>
        <button
          @focus="showMenu = true"
          @blur="showMenu = false"
          class="menu-icon mr-4 w-full h-full flex justify-center items-center"
        >
          <ion-icon name="ellipsis-vertical"></ion-icon>
        </button>
        <div v-if="showMenu" class="popup-menu fadeIn">
          <button
            class="px-4 py-2 w-full btn-hover transition-colors"
            @mousedown="logout"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
    <div
      v-for="room in getAllRooms"
      :key="room.id"
      @click="chatWith(room)"
      class="room-list-item flex items-center p-2 bg-white cursor-pointer shadow-md"
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
            class="truncate w-4/5"
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
            class="user-list-last-message-time"
          >
            {{ getLastMessageTime(room.last_message.created_at) }}
          </span>
        </div>
      </div>
    </div>
    <div v-if="getAllRooms.length === 0" class="loader"></div>
    <router-link
      to="/new"
      class="search-user flex justify-center items-center shadow-lg"
      ><ion-icon name="person-add"></ion-icon>
    </router-link>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex"
import AppIcon from "@/components/Shared/AppIcon"
import { format, parseISO, differenceInDays } from "date-fns"

export default {
  components: { AppIcon },
  data() {
    return {
      showMenu: false
    }
  },
  computed: {
    ...mapGetters("auth", ["getMyDetails"]),
    ...mapGetters("chat", [
      "getAllRooms",
      "getUnreadCounts",
      "getLatestMessages"
    ]),
    iconAttributes() {
      return { width: 20, height: 20, fill: "#fff" }
    },
    profilePicAttributes() {
      return { width: 40, height: 40 }
    }
  },
  methods: {
    ...mapActions("chat", ["UPDATE_CHAT_WINDOW", "EXCLUDE_UNREAD_MESSAGE"]),
    generateRandomColor() {
      return `#${Math.floor(Math.random() * 16777215).toString(16)}`
    },
    getRoomName(users) {
      const user = users.find(item => item.id !== this.getMyDetails.id)
      if (!user) return ""
      return `${user.first_name} ${user.last_name}`
    },
    chatWith(room) {
      this.UPDATE_CHAT_WINDOW(room)
      this.$router.push({ name: "Chat", params: { roomId: room.id } })
      this.EXCLUDE_UNREAD_MESSAGE(room.id)
    },
    unreads(room_id) {
      if (this.getUnreadCounts[room_id]) {
        return this.getUnreadCounts[room_id].count
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
    logout() {
      localStorage.removeItem("token")
      window.location.reload()
    }
  }
}
</script>

<style scoped>
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
  background-color: transparent;
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
  background: var(--search-user-background);
}

.search-user-header {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 100px;
  background: transparent;
  background: var(--search-user-background);
}

.popup-menu {
  width: 10rem;
  height: auto;
  position: absolute;
  top: 3.3rem;
  right: 2.5rem;
  background: var(--room-list-popup-menu-bg-color);
}
</style>
