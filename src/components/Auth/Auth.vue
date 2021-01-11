<template>
  <div class="login-page">
    <form class="form" @submit.prevent="handleSubmit">
      <h2 class="text-3xl">{{ loginPage ? "Log In" : "Sign Up" }}</h2>
      <div v-if="!loginPage">
        <label for="name">First Name</label>
        <input
          v-model="firstName"
          required
          id="firstName"
          type="text"
          autocomplete="off"
        />
      </div>
      <div v-if="!loginPage">
        <label for="lastName">Last Name</label>
        <input
          v-model="lastName"
          required
          id="lastName"
          type="text"
          autocomplete="off"
        />
      </div>
      <div>
        <label for="email">Email</label>
        <input
          v-model="email"
          required
          id="email"
          type="email"
          autocomplete="off"
        />
      </div>
      <div>
        <label for="password">Password</label>
        <input v-model="password" required id="password" type="password" />
      </div>
      <div>
        <input type="submit" class="submit-btn" value="JOIN" />
      </div>
      <p v-if="loginPage" class="inline-block mt-4">
        Don't have account?
        <router-link class="text-blue-400 ml-2" to="/signup">
          Sign Up
        </router-link>
      </p>
      <p v-else class="inline-block mt-4">
        Already have account?
        <router-link class="text-blue-400 ml-2" to="/login">
          Login
        </router-link>
      </p>
    </form>
  </div>
</template>

<script>
import { signupUser, loginUser } from "@/apis/auth"

export default {
  props: {
    loginPage: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    }
  },
  methods: {
    handleSubmit() {
      if (this.loginPage) {
        this.loginUser()
      } else {
        this.signupUser()
      }
    },
    loginUser() {
      const payload = {
        email: this.email,
        password: this.password,
      }

      loginUser(payload)
        .then(res => {
          localStorage.token = res.data.token
          localStorage.user = JSON.stringify(res.data.user)
          localStorage.userId = res.data.user.id
          this.$router.push({ name: "Home" })
        })
        .catch(err => {
          console.log(err)
        })
    },
    signupUser() {
      const payload = {
        first_name: this.firstName,
        last_name: this.lastName,
        email: this.email,
        password: this.password,
      }
      signupUser(payload)
        .then(res => {
          if (res.data.user && res.data.token) {
            console.log("sign up successful!")
            localStorage.token = res.data.token
            localStorage.user = JSON.stringify(res.data.user)
            localStorage.userId = res.data.user.id
            this.$router.push({ name: "Home" })
          } else {
            alert(res.data.message)
          }
        })
        .catch(err => console.log(err))
    },
  },
}
</script>

<style scoped>
.login-page {
  width: 100%;
  height: 100vh;
}

.form {
  width: 100%;
  position: absolute;
  max-width: 30rem;
  margin: auto;
  top: 50%;
  left: 30%;
  transform: translate(-50%, -50%);
  padding: 1.5rem;
  box-shadow: 0 2px 5px 0 #1b1b1b;
  border-radius: 2px;
  background-color: var(--primary-bg-color);
}

.login-page h2 {
  text-align: center;
  margin: 0;
}

.form > div {
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
}

.form > div > input {
  padding: 0.5rem;
  border-radius: 3px;
  margin-top: 0.5rem;
  color: #d6d6d6;
  border: 1px solid;
  border-color: var(--primary-bg-color);
  transition: border-color 0.3s ease-out;
  background-color: var(--primary-bg-color-dark);
}

.form .submit-btn {
  text-align: center;
  background: #7289da;
}

.form input:active,
.form input:focus {
  outline: none;
  border-color: #7289da;
}

@media screen and (max-width: 540px) {
  .form {
    max-width: 95%;
    top: 40%;
    left: 50%;
  }
}
</style>
