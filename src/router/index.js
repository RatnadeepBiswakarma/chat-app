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
    path: "/:roomId",
    name: "Chat",
    component: load("Main/Chat/Chat"),
    meta: {
      title: "Chat",
    },
  },
  {
    path: "/*",
    name: "Home",
    redirect: "/",
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
