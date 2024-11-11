import { invoke } from "@tauri-apps/api/core"

export interface Editor {
	input: string
	collapsed: boolean
	selected: boolean
	title?: string
}

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
	const addEditor = (editor?: Editor) => {
		editors.value.push(editor ?? { input: "", collapsed: false, selected: false })
	}

	const resetEditors = () => {
		editors.value = [{ input: "", collapsed: false, selected: false }]
	}

	const toggleCollapse = (editor: Editor) => {
		editor.collapsed = !editor.collapsed
	}

	const removeEditor = (editor: Editor) => {
		const index = editors.value.indexOf(editor)
		editors.value.splice(index, 1)
		if (editors.value.length === 0) {
			addEditor()
		}
	}

	const formatCode = async (editor: Editor) => {
		if (!tauri.isTauri) return

		try {
			const code = editor.input
			const result = await invoke<string>("format_code", {
				luaCode: code,
			})

			editor.input = result
		} catch (error) {
			console.error("Error formatting code:", error)
		}
	}

	// const lintCode = async (index: number) => {
	// 	if (!tauri.isTauri) return

	// 	try {
	// 		const code = editors.value[index].input
	// 		const result = await invoke<string>("lint_code", {
	// 			luaCode: code,
	// 		})

	// 		console.log(result)
	// 	} catch (error) {
	// 		console.error("Error linting code:", error)
	// 	}
	// }

	const stripCode = (editor: Editor) => {
		editor.input = stripInput(editor.input)
	}

	const removeLogs = (editor: Editor) => {
		//remove all print, warn and error statements ^.*(print|warn|error)\(.*\).*\n?
		let code = editor.input
		code = code.replace(/^.*(print|warn|error)\(.*\).*\n?/gm, "")
		editor.input = code
	}
	return {
		editors,
		currentLanguage,
		addEditor,
		resetEditors,
		toggleCollapse,
		removeEditor,
		formatCode,
		// lintCode,
		stripCode,
		removeLogs,
	}
})
