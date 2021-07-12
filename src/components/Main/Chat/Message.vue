<template>
  <div
    class="flex items-start relative"
    :class="
      sentByMe(item.sender_id)
        ? 'mr-4 justify-end sent'
        : 'ml-4 justify-start received'
    "
  >
    <div
      class="message-section my-2 p-1 px-2 text-white leading-tight shadow-lg flex flex-row items-baseline whitespace-pre-wrap flex-wrap justify-end"
    >
      {{ item.text }}
      <span class="flex items-center timestamp-container">
        <span class="text-xs">{{ geMessageTime(item.created_at) }}</span>
        <span v-if="sentByMe(item.sender_id)" class="flex justify-end">
          <DoubleTick
            v-if="item.status === 'read' || item.status === 'delivered'"
            :read="item.status === 'read'"
            class="tick-mark ml-2"
          />
          <SingleTick v-else class="tick-mark single-tick ml-2" />
        </span>
      </span>
    </div>
  </div>
</template>

<script>
import SingleTick from "@/components/Main/Chat/SingleTick"
import DoubleTick from "@/components/Main/Chat/DoubleTick"
import { mapGetters } from "vuex"
import { format, parseISO, differenceInDays } from "date-fns"

export default {
  components: { SingleTick, DoubleTick },
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapGetters("auth", ["getMyDetails"])
  },
  methods: {
    geMessageTime(date) {
      if (differenceInDays(new Date(), parseISO(date)) > 1) {
        return format(parseISO(date), "LLL d, HH:mm")
      }
      return format(parseISO(date), "HH:mm")
    },
    getUserName(user) {
      return `${user.first_name} ${user.last_name}`
    },
    getProfilePic(first_name) {
      return first_name.slice(0, 1)
    },
    sentByMe(senderId) {
      return senderId === this.getMyDetails.id
    }
  }
}
</script>

<style scoped>
.message-section {
  width: auto;
  max-width: 70%;
  word-wrap: break-word;
  word-break: normal;
}

.received .message-section {
  background: var(--other-message-bg-color);
  border-radius: 0px 10px 8px 10px;
}

.sent .message-section {
  background: var(--own-message-bg-color);
  border-radius: 10px 0px 10px 8px;
}

.tick-mark {
  width: 1rem;
  fill: #ffffff;
  padding-bottom: 2px;
}

.timestamp-container {
  height: 0.8rem;
  color: var(--message-timestamp-color);
}
</style>
