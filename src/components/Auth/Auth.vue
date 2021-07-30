<template>
  <transition name="zoomOut" appear>
    <div class="login-page flex justify-center items-center">
      <div class="particle one"></div>
      <div class="particle two"></div>
      <div class="particle three"></div>
      <div class="particle four"></div>
      <div class="particle five"></div>
      <div class="card-wrapper relative" :class="getCardClass">
        <h2
          class="text-2xl md:text-3xl"
          :class="{
            'delay-fadeIn animate-duration-400': newUser || existingUser
          }"
        >
          {{ heading }}
        </h2>
        <form class="form" @submit.prevent="handleSubmit">
          <div class="flex flex-col mt-4">
            <label for="email">Enter your email</label>
            <input
              v-model="email"
              required
              id="email"
              type="email"
              placeholder="Email"
              autocomplete="off"
              :readonly="newUser || existingUser"
            />
          </div>
          <div v-if="newUser">
            <div class="flex flex-col mt-4 delay-fadeIn animate-duration-600">
              <label for="name">First Name</label>
              <input
                ref="firstName"
                v-model="firstName"
                required
                id="firstName"
                type="text"
                placeholder="First name"
                autocomplete="off"
              />
            </div>
            <div class="flex flex-col mt-4 delay-fadeIn animate-duration-700">
              <label for="lastName">Last Name</label>
              <input
                v-model="lastName"
                required
                id="lastName"
                type="text"
                placeholder="Last name"
                autocomplete="off"
              />
            </div>
          </div>
          <div
            v-if="newUser || existingUser"
            class="flex flex-col mt-4 delay-fadeIn animate-duration-800"
          >
            <label for="password">Password</label>
            <input
              ref="password"
              v-model="password"
              minlength="6"
              required
              id="password"
              placeholder="Password"
              type="password"
            />
            <small class="text-red-500 text-center h-4">{{
              errorMessage
            }}</small>
          </div>
          <div
            class="block flex justify-end items-center"
            :class="{
              'delay-fadeIn animate-duration-900 justify-between':
                newUser || existingUser
            }"
          >
            <input
              v-show="newUser || existingUser"
              type="button"
              class="submit-btn px-4"
              value="Back"
              @click.prevent="goBack"
            />
            <input type="submit" class="submit-btn px-4" value="Next" />
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script>
import { signupUser, loginUser } from "@/apis/auth"
import { getUser } from "@/apis/room"

export default {
  data() {
    return {
      firstName: "",
      lastName: "",
      email: "",
      newUser: false,
      existingUser: false,
      errorMessage: false,
      password: ""
    }
  },
  computed: {
    heading() {
      if (this.existingUser) {
        return `Welcome back!`
      }
      if (this.newUser) {
        return `Let's sign up!`
      }
      return `Let's start`
    },
    getCardClass() {
      if (this.newUser) {
        return "card-new-user"
      }
      if (this.existingUser) {
        return "card-existing-user"
      }
      return ""
    }
  },
  methods: {
    handleSubmit() {
      if (!this.newUser && !this.existingUser) {
        this.findUser()
      } else if (this.existingUser) {
        this.loginUser()
      } else if (this.newUser) {
        this.signupUser()
      }
    },
    findUser() {
      this.errorMessage = ""
      getUser(this.email)
        .then(res => {
          this.firstName = res.data.user.first_name
          this.$nextTick(() => {
            this.existingUser = true
            this.newUser = false
            setTimeout(() => {
              this.$refs.password.focus()
            }, 1000)
          })
        })
        .catch(() => {
          this.existingUser = false
          this.newUser = true
          setTimeout(() => {
            this.$refs.firstName.focus()
          }, 1000)
        })
    },
    goBack() {
      this.existingUser = false
      this.newUser = false
      this.firstName = ""
    },
    loginUser() {
      this.errorMessage = ""
      const payload = {
        email: this.email,
        password: this.password
      }

      loginUser(payload)
        .then(res => {
          localStorage.token = res.data.token
          localStorage.user = JSON.stringify(res.data.user)
          localStorage.userId = res.data.user.id
          this.$emit("setup")
          this.$router.push({ name: "Home" })
        })
        .catch(err => {
          if (err && err.response.status === 403) {
            this.errorMessage = "Invalid password"
          }
        })
    },
    signupUser() {
      const payload = {
        first_name: this.firstName,
        last_name: this.lastName,
        email: this.email,
        password: this.password
      }
      signupUser(payload)
        .then(res => {
          if (res.data.user && res.data.token) {
            localStorage.token = res.data.token
            localStorage.user = JSON.stringify(res.data.user)
            localStorage.userId = res.data.user.id
            this.$emit("setup")
            this.$router.push({ name: "Home" })
          } else {
            alert(res.data.message)
          }
        })
        .catch(err => {
          if (err.response && err.response.data && err.response.data.errors) {
            const errors = err.response.data.errors
            errors.forEach(msg => {
              window.Noty.error(msg)
            })
          }
          console.error(err)
        })
    }
  }
}
</script>

<style scoped>
.login-page {
  width: 100%;
  height: 100vh;
}

.card-wrapper {
  width: 100%;
  height: 14rem;
  max-width: 30rem;
  margin: auto;
  padding: 1.5rem;
  box-shadow: 0 2px 5px 0 #1b1b1b;
  border-radius: 2px;
  background-color: var(--auth-page-card-wrapper-bg);
  transition: height 0.3s ease-out;
  backdrop-filter: blur(5px);
}

.card-new-user {
  height: 31.25rem;
}

.card-existing-user {
  height: 21rem;
}

.login-page h2 {
  text-align: center;
  margin: 0;
}

.form input {
  padding: 0.5rem;
  border-radius: 3px;
  margin-top: 0.5rem;
  color: var(--primary-color);
  border: 1px solid;
  border-color: var(--auth-page-input-default-border);
  transition: border-color 0.3s ease-out;
  background-color: var(--primary-bg-color-dark);
}

.form .submit-btn {
  text-align: center;
  background: var(--auth-page-submit-btn-bg-color);
  padding: 0.5rem 1rem;
  color: var(--auth-page-submit-btn-color);
}

.form input:active,
.form input:focus {
  outline: none;
  border-color: var(--primary-color);
}

@media screen and (max-width: 540px) {
  .card-wrapper {
    max-width: 96%;
  }
}
</style>
