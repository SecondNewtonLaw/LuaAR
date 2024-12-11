import { invoke } from "@tauri-apps/api/core"
import { toast } from "vuetify-sonner"

export interface Editor {
	input: string
	collapsed: boolean
	selected: boolean
	title?: string
	lang?: string
}

export const useEditorStore = defineStore("editors", () => {
	const editors = ref<Editor[]>([
		{
			input: "",
			collapsed: false,
			selected: false,
			lang: "lua",
		},
	])
	const tauri = useTauri()

	const addEditor = (editor?: Editor) => {
		editors.value.push(editor ?? { input: "", collapsed: false, selected: false })
		toast.success("New editor added")
	}

	const resetEditors = () => {
		editors.value = [{ input: "", collapsed: false, selected: false }]
		toast.info("Editors reset")
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

		toast.info("Editor removed")
	}

	const formatCode = async (editor: Editor) => {
		if (!tauri.isTauri) return

		try {
			const code = editor.input
			const result = await invoke<string>("format_code", {
				luaCode: code,
			})

			editor.input = result
			toast.success("Code formatted")
		} catch (error) {
			console.log("Error formatting code:", error)
			toast.error("Error formatting code")
		}
	}

	const lintCode = async (editor: Editor) => {
		if (!tauri.isTauri) return

		try {
			const code = editor.input
			const result = await invoke<string>("lint_code", {
				luaCode: code,
			})

			addEditor({ input: result, collapsed: false, selected: false, title: "Linted Result" })
			toast.success("Code linted")
		} catch (error) {
			console.log("Error linting code:", error)
			toast.error("Error linting code")
		}
	}
	const stripCode = (editor: Editor) => {
		editor.input = stripInput(editor)
		toast.success("Stripped code")
	}

	const removeLogs = (editor: Editor) => {
		editor.input = stripLoggingStatements(editor.input, editor.lang)
		toast.success("Logs removed")
	}
	return {
		editors,

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
