let timer
export default function debounce(cb, time, arg) {
  clearTimeout(timer)
  timer = setTimeout(() => {
    cb(arg)
  }, time || 500)
}
