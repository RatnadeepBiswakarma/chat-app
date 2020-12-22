export function getMessages(roomId) {
  return window.api.get(`/messages/${roomId}`)
}
