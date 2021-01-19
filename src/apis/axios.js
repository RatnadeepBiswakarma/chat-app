import axios from "axios"
import router from "@/router/index"

const instance = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL,
})

instance.interceptors.request.use(config => {
  config.headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-access-token": localStorage.token,
  }
  return config
})

instance.interceptors.response.use(
  function(response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response
  },
  function(error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    console.log(error)
    if (error.response && error.response.status === 401) {
      router.push({ name: "LoginPage" })
    }
    return Promise.reject(error)
  }
)

window.api = {}

window.api.get = (url, params) => instance.get(url, { params })

window.api.patch = (url, data) => instance.patch(url, data)

window.api.post = (url, data) => instance.post(url, data)

window.api.put = (url, data) => instance.put(url, data)

window.api.del = url => instance.delete(url)

export default instance
