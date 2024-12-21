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
export const useSettingsStore = defineStore(
	"settings",
	() => {
		const loc = ref(200)
		const defaultLanguage = ref<CodeLanguage>("lua")
		const defaultRole = ref<Role>("Lua")
		const languages = ref<CodeLanguage[]>(["lua", "typescript", "html", "css", "json", "python"])
		const roles = ref<Role[]>([
			"Lua",
			"JavaScript",
			"Python",
			"C#",
			"C++",
			"PHP",
			"Java",
			"HTML/CSS",
			"Vanilla Lua",
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
			"Game Producers",
			"Community Creator",
			"YouTuber",
			"Video Editor",
		])
		return {
			loc,
			defaultLanguage,
			languages,
			roles,
			defaultRole,
		}
	},
	{
		persist: true,
	}
)
