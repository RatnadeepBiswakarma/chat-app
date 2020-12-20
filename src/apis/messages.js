export function getMessages() {
  return window.api.get("/posts")
}
