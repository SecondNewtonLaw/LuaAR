export const useTauri = () => {
	const isTauri = process.env.TAURI === "true"

	return {
		isTauri,
	}
}
