export function isMobile() {
  if (navigator.userAgent.match(/android|iPhone|Windows Phone/i)) {
    return true
  }
  return false
}
