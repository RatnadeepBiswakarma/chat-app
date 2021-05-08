<template>
  <div>
    <vue-final-modal
      v-model="showIncomingCallModal"
      classes="modal-container"
      :content-class="getContentClasses"
      :clickToClose="false"
    >
      <div
        v-if="callConnected || initiatedByMe"
        class="flex justify-center h-full"
      >
        <video id="video" class="w-full h-auto remote-video"></video>
        <video id="own-video" class="own-video"></video>
      </div>
      <div v-else class="text-center flex flex-col justify-between h-full">
        <div class=" flex justify-center flex-col">
          <h3 class="text-2xl">
            {{ getCallHeading }}
          </h3>
          <AppIcon
            name="user"
            :attributes="profilePicAttributes"
            class="flex justify-center my-10 user-pic m-auto rounded-full"
          />
        </div>
      </div>
      <div class="btns-section flex justify-center">
        <button
          class="call-btn mx-4 rounded-full call-decline"
          @click="hangUpCall"
        >
          <AppIcon
            name="phone-call"
            :attributes="{ width: 30, height: 30, fill: '#fff' }"
            class="flex justify-center"
            style="transform: rotate(135deg);"
          />
        </button>
        <button
          v-if="videoCall && !initiatedByMe && !callConnected"
          @click="answerCall()"
          class="call-btn mx-4 rounded-full call-accept"
        >
          <AppIcon
            name="video-camera"
            :attributes="{ width: 30, height: 30, fill: '#fff' }"
            class="flex justify-center"
          />
        </button>
        <button
          v-if="!initiatedByMe && !callConnected"
          @click="answerCall"
          class="call-btn mx-4 rounded-full call-accept"
        >
          <AppIcon
            name="phone-call"
            :attributes="{ width: 30, height: 30, fill: '#fff' }"
            class="flex justify-center"
          />
        </button>
      </div>
    </vue-final-modal>
  </div>
</template>

<script>
import AppIcon from "@/components/Shared/AppIcon"
import { mapGetters, mapActions } from "vuex"

export default {
  components: { AppIcon },
  props: {
    call: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showIncomingCallModal: true
    }
  },
  computed: {
    ...mapGetters("chat", ["socket", "peer", "getOpenWindow", "getCall"]),
    ...mapGetters("auth", ["getMyDetails", "isLoggedIn"]),
    getContentClasses() {
      let classes = "modal-content bg-white p-12"
      if (this.callConnected) {
        classes = +" call-connected"
      }
      return classes
    },
    getCallHeading() {
      if (this.initiatedByMe) {
        return `Calling ${this.getCall.metadata.target_user.first_name}`
      }
      return `Incoming ${this.videoCall ? "Video" : "Audio"} Call`
    },
    videoCall() {
      return this.getCall && this.getCall.metadata.type === "video"
    },
    initiatedByMe() {
      return (
        this.getCall.metadata &&
        this.getCall.metadata.initiator === this.getMyDetails.id
      )
    },
    callConnected() {
      return this.getCall.open
    },
    profilePicAttributes() {
      return { width: 100, height: 100 }
    }
  },
  methods: {
    ...mapActions("chat", ["UPDATE_PEER", "UPDATE_SIGNAL_DATA", "UPDATE_CALL"]),
    answerCall() {
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: { width: { min: 1280 }, height: { min: 720 } }
        })
        .then(stream => {
          this.getCall.on("close", () => {
            //
          })
          this.getCall.answer(stream)
          // emit call connected to backend
          this.socket.emit("call_connected", {
            room_id: this.getCall.metadata.room_id
          })
          this.$nextTick(() => {
            let video = document.querySelector("#own-video")
            video.autoplay = true
            video.volume = 0
            video.muted = true
            video.srcObject = stream
          })
          this.getCall.on("stream", remoteStream => {
            let video = document.querySelector("#video")
            video.autoplay = true
            video.volume = 0.5
            video.srcObject = remoteStream
          })
        })
    },
    hangUpCall() {
      if (this.getCall.localStream) {
        this.getCall.localStream.getTracks().forEach(function(track) {
          track.stop()
        })
      }
      this.socket.emit("call_disconnected", {
        room_id: this.getCall.metadata.room_id
      })
      this.getCall.close()
      this.UPDATE_CALL(null)
      // emit socket event here to inform other party
    }
  }
}
</script>

<style scoped>
::v-deep .modal-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
::v-deep .modal-content {
  position: relative;
  display: flex;
  flex-direction: column;
  margin: auto;
  padding: 0;
  border: 1px solid var(--incoming-call-popup-border-color);
  border-radius: 0.25rem;
  background: var(--incoming-call-popup-bg-color);
  width: 100%;
  height: 100%;
  max-width: 25rem;
  max-height: 40rem;
  box-shadow: 0 8px 30px 0px #0000008f;
  backdrop-filter: blur(3px);
}

::v-deep .vfm__content {
  width: 100%;
  height: 100%;
}

::v-deep .call-connected {
  width: 100%;
  max-width: 100%;
  height: 100%;
}

.user-pic {
  width: 100px;
  height: 100px;
  animation: wide-shadow 1.5s linear infinite;
}

.btns-section {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
}

.call-btn {
  width: 3.5rem;
  height: 3.5rem;
  background: #00d300;
  z-index: 2;
}

.call-decline {
  background: #ff2c2c;
}

.own-video {
  width: 6rem;
  height: auto;
  position: absolute;
  right: 0.5rem;
  bottom: 0.5rem;
  z-index: 1;
}

/* flip the video */
.own-video,
.remote-video {
  transform: scaleX(-1);
}

@keyframes wide-shadow {
  40% {
    box-shadow: 0px 0px 0px 0px #ffffff41;
  }

  100% {
    box-shadow: 0px 0px 0px 50px #ffffff00;
  }
}
</style>
