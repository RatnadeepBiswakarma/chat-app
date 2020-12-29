<template>
  <div
    ref="iconHolder"
    v-html="require(`../../assets/Icons/${name}.svg`)"
  ></div>
</template>
<script>
export default {
  props: ["name", "attributes"],
  watch: {
    attributes: {
      handler() {
        if (this.attributes) {
          this.$nextTick(() => {
            if (this.$refs.iconHolder) {
              const svg = this.$refs.iconHolder.querySelector("svg")
              if (this.attributes && svg) {
                Object.keys(this.attributes).forEach(key => {
                  svg.setAttribute(key, this.attributes[key])
                })
              }
            }
          })
        }
      },
      immediate: true,
    },
  },
}
</script>
