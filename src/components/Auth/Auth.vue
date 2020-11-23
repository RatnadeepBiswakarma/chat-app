<template>
  <div class="login-page">
    <form class="form" @submit.prevent="handleSubmit">
      <h2>{{ loginPage ? "Log In" : "Sign Up" }}</h2>
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
    </form>
  </div>
</template>

<script>
import { signupUser } from "@/apis/auth"

export default {
  data() {
    return {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    }
  },
  computed: {
    loginPage() {
      return false
    },
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
      //
    },
    signupUser() {
      //
      const payload = {
        first_name: this.firstName,
        last_name: this.lastName,
        email: this.email,
        password: this.password,
      }
      signupUser(payload)
        .then(res => {
          console.log(res.data)
          if (res.data.user && res.data.token) {
            console.log("sign up successful!")
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
  max-width: 80%;
  margin: auto;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 1.5rem;
  box-shadow: 0 2px 5px 0 #1b1b1b;
  border-radius: 2px;
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

@media screen and (min-width: 540px) {
  .form {
    max-width: 30rem;
  }
}
</style>
