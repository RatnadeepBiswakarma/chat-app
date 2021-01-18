<template>
  <transition name="zoomIn" appear>
    <div class="new-chat-window-container w-full bg-white">
      <div class="header flex items-center">
        <button
          class="back-button text-white leading-none ml-2 px-2"
          @click="goBack"
        >
          <Back class="back-arrow" />
        </button>
        <form
          v-if="search"
          class="input-section flex items-center h-full w-full"
          @submit.prevent="findUser"
        >
          <input
            type="email"
            v-model="email"
            class="email-input h-full w-4/5 p-2 border bg-transparent text-white border-none outline-none"
            placeholder="Enter user email"
          />
          <button class="w-1/5 h-full flex items-center justify-center">
            <AppIcon name="magnifying-glass" :attributes="iconAttributes" />
          </button>
        </form>
      </div>
      <div v-if="searchResult.length > 0">
        <div
          v-for="user in searchResult"
          :key="user.id"
          class="room-list-item flex items-center p-2 bg-white"
          @click="handleUserClick(user)"
        >
          <div class="room-pic mr-4 ml-2">
            <AppIcon name="user" :attributes="prifilePicAttributes" />
          </div>
          <div class="w-4/5 h-full">
            <div class="user-name flex truncate">
              {{ getUserName(user) }}
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center mt-8">{{ errorMessage }}</div>
    </div>
  </transition>
</template>

<script>
import { getUser } from "@/apis/room"
import Back from "@/components/Shared/Back"
import AppIcon from "@/components/Shared/AppIcon"
import { mapActions, mapGetters } from "vuex"

export default {
  components: { Back, AppIcon },
  data() {
    return {
      search: true,
      email: "coder@mail.com",
      searchResult: [],
      errorMessage: ""
    }
  },
  computed: {
    ...mapGetters("chat", ["getAllRooms"]),
    iconAttributes() {
      return { width: 20, height: 20, fill: "#fff" }
    },
    prifilePicAttributes() {
      return { width: 40, height: 40 }
    }
  },
  methods: {
    ...mapActions("chat", [
      "UPDATE_NEW_USER_DETAILS",
      "UPDATE_CHAT_WINDOW",
      "EXCLUDE_UNREAD_MESSAGE"
    ]),
    handleUserClick(user) {
      const room = this.getAllRooms.find(r => {
        if (r.users.find(u => u.id === user.id)) {
          return r
        }
      })
      // if room is already present, push that
      if (room) {
        this.UPDATE_CHAT_WINDOW(room)
        this.$router.push({ name: "Chat", params: { roomId: room.id } })
        this.EXCLUDE_UNREAD_MESSAGE(room.id)
      } else {
        // else user id is used to create initial chat window
        this.UPDATE_NEW_USER_DETAILS(user)
        this.$router.push({
          name: "NewChatWindow",
          params: { userId: user.id }
        })
      }
    },
    getUserName(user) {
      return `${user.first_name} ${user.last_name}`
    },
    goBack() {
      this.$router.replace({ name: "Home" })
    },
    findUser() {
      this.errorMessage = ""
      getUser(this.email)
        .then(res => {
          this.searchResult = [res.data.user]
        })
        .catch(err => {
          if (err.response && err.response.status === 404) {
            this.errorMessage = "No user found with this email id"
          } else {
            this.errorMessage =
              "Something went wrong, we're looking into it. Please try after sometime"
          }
        })
    }
  }
}
</script>

<style scoped>
.back-arrow {
  width: 1.3rem;
  fill: white;
}

.email-input {
  color: var(--search-input-font-color);
}

.email-input::placeholder {
  color: var(--search-input-placeholder-color);
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
</style>
