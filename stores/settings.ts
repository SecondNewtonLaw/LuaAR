export type CodeLanguage = "lua" | "typescript" | "html" | "css" | "json" | "python"
export type Role =
	| "Lua"
	| "JavaScript"
	| "Python"
	| "C#"
	| "C++"
	| "PHP"
	| "Java"
	| "HTML/CSS"
	| "Vanilla Lua"
	| "Graphics Artist"
	| "Texture Artist"
	| "Clothing"
	| "Terrain Editor"
	| "Builder"
	| "3D Modeler"
	| "Visual Effects"
	| "Sound Effects"
	| "Music Composer"
	| "Animator"
	| "Interface Designer"
	| "Voice Actor"
	| "Game Producers"
	| "Community Creator"
	| "YouTuber"
	| "Video Editor"

const groupedRoles: Record<string, Role[]> = {
	Programming: ["Lua", "JavaScript", "Python", "C#", "C++", "PHP", "Java", "HTML/CSS", "Vanilla Lua"],
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
	],
	Generic: ["Game Producers", "Community Creator", "YouTuber", "Video Editor"],
}
export const useSettingsStore = defineStore(
	"settings",
	() => {
		const loc = ref(200)
		const defaultLanguage = ref<CodeLanguage>("lua")
		const defaultRole = ref<Role>("Lua")
		const languages = ref<CodeLanguage[]>(["lua", "typescript", "html", "css", "json", "python"])
		const roles = ref<Role[]>(Object.keys(groupedRoles).flatMap((key) => groupedRoles[key]))
		const getGroupByRole = (role: Role) => Object.keys(groupedRoles).find((key) => groupedRoles[key].includes(role))
		const getRolesByGroup = (group: string) => groupedRoles[group]
		const group = computed(() => getGroupByRole(defaultRole.value))
		return {
			loc,
			defaultLanguage,
			languages,
			roles,
			defaultRole,
			getGroupByRole,
			getRolesByGroup,
			group,
		}
	},
	{
		persist: true,
	}
)
