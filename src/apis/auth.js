export function signupUser(payload) {
  return window.api.post("/users", payload)
}

export function loginUser(payload) {
  return window.api.post("/users/login", payload)
}

export function validateUserToken() {
	return window.api.get("/auth")
}
