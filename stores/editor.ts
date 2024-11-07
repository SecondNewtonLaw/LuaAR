import { invoke } from "@tauri-apps/api/core"
import type { Editor } from "~/types"
export const useEditorStore = defineStore("editors", () => {
	const editors = ref<Editor[]>([
		{
			input: "",
			collapsed: false,
			selected: false,
		},
	])
	const tauri = useTauri()
	const currentLanguage = ref<string>("lua")
	const addEditor = () => {
		editors.value.push({ input: "", collapsed: false, selected: false })
	}

	const resetEditors = () => {
		editors.value = [{ input: "", collapsed: false, selected: false }]
	}

	const toggleCollapse = (index: number) => {
		editors.value[index].collapsed = !editors.value[index].collapsed
	}

	const removeEditor = (index: number) => {
		editors.value.splice(index, 1)
	}

	const formatCode = async (index: number) => {
		if (!tauri.isTauri) return

		try {
			const code = editors.value[index].input
			const result = await invoke<string>("format_code", {
				luaCode: code,
			})

			editors.value[index].input = result
		} catch (error) {
			console.error("Error formatting code:", error)
		}
	}

	const lintCode = async (index: number) => {
		if (!tauri.isTauri) return

		try {
			const code = editors.value[index].input
			const result = await invoke<string>("lint_code", {
				luaCode: code,
			})

			console.log(result)
		} catch (error) {
			console.error("Error linting code:", error)
		}
	}

	const stripCode = (index: number) => {
		let code = editors.value[index].input

		code = code.replace(/--\[\[[\s\S]*?\]\]/g, "")
		code = code.replace(/--.*$/gm, "")

		// Remove empty lines
		editors.value[index].input = code
			.split("\n")
			.filter((line) => line.trim() !== "")
			.join("\n")
	}

	const removeLogs = (index: number) => {
		//remove all print, warn and error statements ^.*(print|warn|error)\(.*\).*\n?
		let code = editors.value[index].input
		code = code.replace(/^.*(print|warn|error)\(.*\).*\n?/gm, "")
		editors.value[index].input = code
	}
	return {
		editors,
		currentLanguage,
		addEditor,
		resetEditors,
		toggleCollapse,
		removeEditor,
		formatCode,
		lintCode,
		stripCode,
		removeLogs,
	}
})
