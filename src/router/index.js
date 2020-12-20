import { createWebHistory, createRouter } from "vue-router"

function load(component) {
  return () => import(`@/components/${component}.vue`)
}

const routes = [
  {
    path: "/login",
    name: "LoginPage",
    props: {
      loginPage: true,
    },
    component: load("Auth/Auth"),
    meta: {
      title: "Login Page",
    },
  },
  {
    path: "/signup",
    name: "SignupPage",
    component: load("Auth/Auth"),
    meta: {
      title: "Signup Page",
    },
  },
  {
    path: "/",
    name: "Home",
    component: load("Main/Home"),
    meta: {
      title: "App",
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
