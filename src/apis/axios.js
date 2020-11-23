import axios from "axios"

const instance = axios.create({
  baseURL: "http://localhost:5050/",
})

instance.interceptors.request.use(config => {
  config.headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-access-token": localStorage.token,
  }
  return config
})

window.api = {}

window.api.get = (url, params) => instance.get(url, { params })

window.api.patch = (url, data) => instance.patch(url, data)

window.api.post = (url, data) => instance.post(url, data)

window.api.put = (url, data) => instance.put(url, data)

window.api.del = url => instance.delete(url)

export default instance
