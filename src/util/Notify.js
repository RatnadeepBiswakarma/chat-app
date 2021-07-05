import Push from "push.js"

export default {
  install(Vue) {
    Vue.mixin({
      methods: {
        $notify(title, options) {
          return Push.create(title, {
            timeout: 5000,
            onClick: function() {
              window.focus()
              this.close()
            },
            ...options
          })
        },
        $requestNotificationPermission(onGranted, onDenied) {
          return Push.Permission.request(onGranted, onDenied)
        },
        $notificationAllowed() {
          return Push.Permission.has()
        }
      }
    })
  }
}
