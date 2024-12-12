declare global {
	interface Window {
		__TAURI__?: any
	}
}

export const isTauri = () => window.__TAURI__ !== undefined
