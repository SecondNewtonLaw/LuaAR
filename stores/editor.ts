import { invoke } from "@tauri-apps/api/core"
import { toast } from "vuetify-sonner"
import type { CodeLanguage } from "./settings"

export interface Editor {
	input: string
	collapsed: boolean
	selected: boolean
	title?: string
	lang?: CodeLanguage
}

export const useEditorStore = defineStore("editors", () => {
	const settingsStore = useSettingsStore()
	const editors = ref<Editor[]>([
		{
			input: "",
			collapsed: false,
			selected: false,
			lang: settingsStore.defaultLanguage,
		},
	])

	const tauri = isTauri()

	const addEditor = (editor: Editor = { input: "", collapsed: false, selected: false }) => {
		editor.lang ??= settingsStore.defaultLanguage
		editors.value.push(editor)
	}

	const resetEditors = () => {
		editors.value = []
		addEditor()
	}

	const toggleCollapse = (editor: Editor) => {
		editor.collapsed = !editor.collapsed
	}

	const removeEditor = (editor: Editor) => {
		const index = editors.value.indexOf(editor)
		editors.value.splice(index, 1)

		toast.info("Editor removed")
	}

	const formatCode = async (editor: Editor) => {
		if (!tauri) return

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
		if (!tauri) return

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
