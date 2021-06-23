export function getMessages(roomId, query) {
  const { skip = 0, limit = 40 } = query
  return window.api.get(`/messages/${roomId}?&skip=${skip}&limit=${limit}`)
}

export function patchRead(room_id, payload) {
  return window.api.patch(`/messages/${room_id}`, payload)
}
