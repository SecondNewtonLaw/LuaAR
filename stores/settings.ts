const groupedSkills = {
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
export type Skill = (typeof groupedSkills)[keyof typeof groupedSkills][number]
export const useSettingsStore = defineStore(
	"settings",
	() => {
		const loc = ref(200)
		const defaultLanguage = ref<CodeLanguage>("lua")
		const defaultSkill = ref<Skill>("Lua")
		const skills = ref<Skill[]>(
			Object.keys(groupedSkills).flatMap((key) => groupedSkills[key as keyof typeof groupedSkills])
		)
		const getGroupBySkill = (skill: never) =>
			(Object.keys(groupedSkills) as Array<keyof typeof groupedSkills>).find((key) =>
				groupedSkills[key].includes(skill)
			)
		const getSkillsByGroup = (group: keyof typeof groupedSkills) => groupedSkills[group]
		const group = computed(() => getGroupBySkill(defaultSkill.value as unknown as never))

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
			skills,
			defaultSkill,

			getSkillsByGroup,
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
