export const useSettingsStore = defineStore(
	"settings",
	() => {
		const loc = ref(200)
		return {
			loc,
		}
	},
	{
		persist: true,
	}
)
