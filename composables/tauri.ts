declare global {
	interface Window {
		__TAURI__?: any
	}
}

export const useTauri = () => {
	const isTauri = window.__TAURI__ !== undefined
	console.log(isTauri)
	return {
		isTauri,
	}
}
