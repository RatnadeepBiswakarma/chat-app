import { createWebHistory, createRouter } from "vue-router"

function load(component) {
  return () => import(`@/components/${component}.vue`)
}

const routes = [
  {
    path: "/login",
    name: "LoginPage",
    component: load("Auth/Auth"),
    meta: {
      title: "Login Page"
    }
  },
  {
    path: "/:roomId",
    name: "Chat",
    component: load("Main/Chat/Chat"),
    meta: {
      title: "Chat"
    }
  },
  {
    path: "/start-chat/:userId",
    name: "NewChatWindow",
    component: load("Main/Chat/Chat"),
    meta: {
      title: "Chat"
    }
  },
  {
    path: "/new",
    name: "Search",
    component: load("Main/NewChat"),
    meta: {
      title: "Search"
    }
  },
  {
    path: "/*",
    name: "Home",
    redirect: "/"
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
