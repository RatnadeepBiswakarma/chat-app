export function getMessages(roomId) {
  return window.api.get(`/messages/${roomId}`)
}

export function patchRead(room_id, payload) {
  return window.api.patch(`/messages/${room_id}`, payload)
}
