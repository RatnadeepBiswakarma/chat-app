export function signupUser(payload) {
  return window.api.post("/users", payload)
}
