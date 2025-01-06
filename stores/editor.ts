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
	const editors = ref<Editor[]>([])

	const tauri = isTauri()

	const addEditor = (editor: Editor = { input: "", collapsed: false, selected: false }) => {
		editor.lang ??= settingsStore.defaultLanguage
		editors.value.push(editor)
	}

	const resetEditors = () => {
		editors.value = []
		settingsStore.group === "Programming" && addEditor()
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
		const parsedResult = await processLintResult(editor)
		if (!parsedResult) return

		const { details, summary } = parsedResult
		console.log("Lint Results:", details, summary)
		addEditor({
			input: JSON.stringify(details, null, 2),
			collapsed: false,
			selected: false,
			lang: "json",
			title: `Lint Results: ${summary.errors} errors, ${summary.warnings} warnings`,
		})
	}

	const applyLintFixes = async (editor: Editor) => {
		const parsedResult = await processLintResult(editor)
		if (!parsedResult) return

		const { details, summary } = parsedResult
		
		if (summary.errors > 0) {
			toast.error("Failed to apply lint fixes: code contains errors, aborting")
		}

		console.log("Hello")
		for (const detail of details.warnings) {
			// We can fix some lints that have simple solutions, such as definitions without use
			if (detail.message.includes("is assigned a value, but never used") && typeof(detail.code) === "string"){
				editor.input = editor.input.replace(detail.code, "")
			}
		}
		
		console.log("Apply Lint Fixes Called. Results:", details, summary)
	}

	const stripCode = (editor: Editor) => {
		editor.input = stripInput(editor)
		toast.success("Stripped code")
	}

	const removeLogs = (editor: Editor) => {
		editor.input = stripLoggingStatements(editor.input, editor.lang)
		toast.success("Logs removed")
	}

	resetEditors()
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
		applyLintFixes
	}
})
