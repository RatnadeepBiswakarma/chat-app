<template>
  <div>
    <vue-final-modal
      v-model="showIncomingCallModal"
      classes="modal-container"
      :content-class="getContentClasses"
      :clickToClose="false"
    >
      <CallDetails
        v-if="!getCallConnectionStatus || !videoCall"
        :callType="videoCall ? 'video' : 'audio'"
        :initiatedByMe="initiatedByMe"
        :targetPerson="targetPerson"
        class="mt-12"
      />
      <div
        v-if="getCallConnectionStatus || initiatedByMe"
        class="flex justify-center h-full"
      >
        <video id="video" class="w-full h-auto remote-video"></video>
        <video id="own-video" class="own-video"></video>
      </div>
      <div class="btns-section flex justify-center">
        <button
          v-if="getCallConnectionStatus"
          class="call-btn mx-4 rounded-full"
          :class="{ 'mic-muted': !micEnabled }"
          @click="toggleMuteMyAudio"
        >
          <ion-icon v-if="micEnabled" name="mic"></ion-icon>
          <ion-icon v-else name="mic-off"></ion-icon>
        </button>
        <button
          v-if="
            videoCall && !initiatedByMe && !getCallConnectionStatus && videoCall
          "
          @click="answerCall()"
          class="call-btn mx-4 rounded-full call-accept"
        >
          <ion-icon name="videocam"></ion-icon>
        </button>
        <button
          v-if="!initiatedByMe && !getCallConnectionStatus && !videoCall"
          @click="answerCall"
          class="call-btn mx-4 rounded-full call-accept"
        >
          <ion-icon name="call"></ion-icon>
        </button>
        <button
          class="call-btn mx-4 rounded-full call-decline"
          @click="hangUpCall"
        >
          <ion-icon name="call"></ion-icon>
        </button>
      </div>
    </vue-final-modal>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex"
import CallDetails from "@/components/Calls/CallDetails"

export default {
  components: { CallDetails },
  props: {
    call: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showIncomingCallModal: true,
      micEnabled: true
    }
  },
  computed: {
    ...mapGetters("chat", [
      "socket",
      "peer",
      "getOpenWindow",
      "getCall",
      "getCallConnectionStatus",
      "getMyMediaStream"
    ]),
    ...mapGetters("auth", ["getMyDetails", "isLoggedIn"]),
    getContentClasses() {
      let classes = "modal-content bg-white p-12"
      if (this.getCallConnectionStatus) {
        classes += " call-connected"
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
      return this.getCall && this.getCall.metadata.video
    },
    initiatedByMe() {
      return (
        this.getCall.metadata &&
        this.getCall.metadata.initiator.id === this.getMyDetails.id
      )
    },
    targetPerson() {
      if (this.getCall.metadata.initiator.id === this.getMyDetails.id) {
        return this.getCall.metadata.target_user
      }
      return this.getCall.metadata.initiator
    },
    profilePicAttributes() {
      return { width: 100, height: 100 }
    }
  },
  methods: {
    ...mapActions("chat", [
      "UPDATE_PEER",
      "UPDATE_SIGNAL_DATA",
      "UPDATE_CALL",
      "UPDATE_CALL_CONNECTION_STATUS",
      "UPDATE_MY_MEDIA_STREAM"
    ]),
    toggleMuteMyAudio() {
      if (this.getMyMediaStream) {
        this.getMyMediaStream.getAudioTracks().forEach(track => {
          if (track.kind === "audio") {
            track.enabled = !track.enabled
            this.micEnabled = track.enabled
          }
        })
      }
    },
    answerCall() {
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: this.getCall.metadata.video
        })
        .then(stream => {
          this.UPDATE_MY_MEDIA_STREAM(stream)
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
          this.UPDATE_CALL_CONNECTION_STATUS(true)
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
      this.UPDATE_CALL_CONNECTION_STATUS(false)
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
  display: flex;
  justify-content: center;
  align-items: center;
  width: 3.5rem;
  height: 3.5rem;
  background: #00d300;
  z-index: 2;
}

.call-btn ion-icon {
  width: 2rem;
  height: 2rem;
}

.call-decline {
  background: var(--button-danger-bg-color);
}

.mic-muted {
  background: var(--button-danger-bg-color);
}

.call-decline ion-icon {
  transform: rotate(136deg);
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
