<template>
  <transition name="zoomIn" appear>
    <div
      class="flex flex-col justify-start w-full h-full settings-window"
      style="height: 94vh"
    >
      <div class="header w-full flex items-center">
        <button
          class="back-button text-white leading-none px-2 h-full"
          @click="goBack"
        >
          <ion-icon name="arrow-back"></ion-icon>
        </button>
        <h2 class="font-noraml text-xl">Settings</h2>
      </div>
      <div class="settings-container m-auto mt-4">
        <div class="flex justify-between items-center">
          <label for="notification-setting">Browser Notification</label>
          <ToggleButton
            :value="getMyDetails.browser_notification"
            @input="updateBrowserNotification"
          />
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import ToggleButton from "@/components/Shared/ToggleButton"
import { mapActions, mapGetters } from "vuex"
import { updatePreference } from "@/apis/auth"

export default {
  components: {
    ToggleButton
  },
  computed: {
    ...mapGetters("auth", ["getMyDetails"])
  },
  methods: {
    ...mapActions("auth", ["UPDATE_BROWSER_NOTIFICATION"]),
    updateBrowserNotification(state) {
      this.UPDATE_BROWSER_NOTIFICATION(state)
      updatePreference({ browser_notification: state })
        .then(() => {
          window.Noty.success(`Notification ${state ? "Enabled" : "Disabled"}!`)
        })
        .catch(err => {
          console.error(err)
          window.Noty.error(
            "Failed to update notification preference to server"
          )
        })
    },
    goBack() {
      this.$router.replace({ name: "Home" })
    }
  }
}
</script>

<style scoped>
.settings-container {
  width: 70%;
}

@media screen and (max-width: 540px) {
  .settings-container {
    width: 90%;
  }
}
</style>
