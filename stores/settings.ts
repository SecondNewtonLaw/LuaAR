const groupedRoles = {
	Programming: ["Lua", "JavaScript", "Python", "C#", "C++", "PHP", "Java", "HTML/CSS", "Vanilla Lua"] as const,
	Art: [
		"Graphics Artist",
		"Texture Artist",
		"Clothing",
		"Terrain Editor",
		"Builder",
		"3D Modeler",
		"Visual Effects",
		"Sound Effects",
		"Music Composer",
		"Animator",
		"Interface Designer",
		"Voice Actor",
	] as const,
	Generic: ["Game Producers", "Community Creator", "YouTuber", "Video Editor"] as const,
}

const languages = ["lua", "typescript", "html", "css", "json", "python"] as const

export type CodeLanguage = (typeof languages)[number]
export type Role = (typeof groupedRoles)[keyof typeof groupedRoles][number]
export const useSettingsStore = defineStore(
	"settings",
	() => {
		const loc = ref(200)
		const defaultLanguage = ref<CodeLanguage>("lua")
		const defaultRole = ref<Role>("Lua")
		const roles = ref<Role[]>(
			Object.keys(groupedRoles).flatMap((key) => groupedRoles[key as keyof typeof groupedRoles])
		)
		const getGroupByRole = (role: never) =>
			(Object.keys(groupedRoles) as Array<keyof typeof groupedRoles>).find((key) =>
				groupedRoles[key].includes(role)
			)
		const getRolesByGroup = (group: keyof typeof groupedRoles) => groupedRoles[group]
		const group = computed(() => getGroupByRole(defaultRole.value as unknown as never))

		//reviews
		const reviewPage = ref(1)

		const today = new Date()
		const startHalf = today.getDate() < 15 ? 1 : 16
		const startDateString = ref(new Date(today.getFullYear(), today.getMonth(), startHalf).toISOString())
		const endDateString = ref(
			new Date(today.getFullYear(), today.getMonth() + 1, startHalf === 1 ? 15 : 0).toISOString()
		)

		const startDate = computed({
			get: () => new Date(startDateString.value),
			set: (date: Date) => (startDateString.value = date.toISOString()),
		})
		const endDate = computed({
			get: () => new Date(endDateString.value),
			set: (date: Date) => (endDateString.value = date.toISOString()),
		})

		return {
			loc,
			defaultLanguage,
			languages,
			roles,
			defaultRole,

			getRolesByGroup,
			group,

			//reviews
			reviewPage,
			startDate,
			endDate,
			startDateString,
			endDateString,
		}
	},
	{
		persist: true,
	}
)
