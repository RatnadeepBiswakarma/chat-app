export function getRooms() {
  return window.api.get("/rooms")
}

export function getUser(email) {
  return window.api.get(`/users/${email}`)
}
