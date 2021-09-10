<template>
  <label class="switch">
    <input
      type="checkbox"
      class="checkbox"
      :checked="value"
      @input="handleInput"
    />
    <span class="slider"></span>
  </label>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  emits: ["input"],
  methods: {
    handleInput(evt) {
      this.$emit("input", evt.target.checked)
    }
  }
}
</script>

<style scoped>
.switch {
  display: inline-block;
  position: relative;
  width: 45px;
  height: 24px;
}

.switch .checkbox {
  width: 0;
  height: 0;
  opacity: 0;
}

.slider {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: #e2e2e2;
  cursor: pointer;
  transition: 0.3s ease-out;
}

.slider:before {
  position: absolute;
  bottom: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  background-color: white;
  box-shadow: 0 1px 2px rgb(95, 95, 95);
  content: "";
  transition: 0.4s;
}

input:checked + .slider {
  background-color: #58b4ff;
}

input:focus + .slider {
  box-shadow: 0 0 1px #58b4ff;
}

input:checked + .slider:before {
  transform: translateX(21px);
}

/* Rounded sliders */
.slider {
  border-radius: 45px;
}

.slider:before {
  border-radius: 50%;
}
</style>
