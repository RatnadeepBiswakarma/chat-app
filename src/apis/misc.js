export function pingServer() {
	return window.api.get("/ping")
}
