import { invoke } from "@tauri-apps/api/core"
import { toast } from "vuetify-sonner"

export interface LintSummary {
	errors: number
	warnings: number
	parseErrors: number
}

export interface LintDetailItem {
	type: string
	message: string
	lineNumber: number | null
	code: string | null
}

export interface LintDetails {
	errors: LintDetailItem[]
	warnings: LintDetailItem[]
	parseErrors: LintDetailItem[]
}

export interface LintResult {
	summary: LintSummary
	details: LintDetails
}
const parseLintResult = (result: string) => {
	const errors = []
	const warnings = []
	const parseErrors = []

	const lines = result.split("\n")

	let currentError: LintDetailItem | null = null
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]

		if (line.startsWith("error[")) {
			currentError = {
				type: "error",
				message: line.match(/error\[.*?\]:\s(.*)/)?.[1] || "Unknown error",
				lineNumber: null,
				code: null,
			}
		} else if (line.startsWith("warning[")) {
			currentError = {
				type: "warning",
				message: line.match(/warning\[.*?\]:\s(.*)/)?.[1] || "Unknown warning",
				lineNumber: null,
				code: null,
			}
		} else if (line.startsWith("  ┌─")) {
			const match = line.match(/:(\d+):(\d+)/)
			if (match && currentError) {
				currentError.lineNumber = parseInt(match[1], 10)
			}
		} else if (line.startsWith("  │")) {
			const codeLineMatch = lines[i + 1]?.match(/^\d+\s\│\s(.*)/)
			if (codeLineMatch && currentError) {
				currentError.code = codeLineMatch[1]
				i++ // Skip the next line as it's processed here
			}
		} else if (currentError) {
			// Decide where to push the parsed error
			if (currentError.type === "error") {
				errors.push(currentError)
			} else if (currentError.type === "warning") {
				warnings.push(currentError)
			} else if (currentError.type === "parse_error") {
				parseErrors.push(currentError)
			}

			currentError = null // Reset for the next entry
		}
	}

	// Collect summary
	const summaryLine = lines.find((line) => line.startsWith("Results:"))
	const summary = {
		errors: parseInt(summaryLine?.match(/(\d+) errors/)?.[1] || "0", 10),
		warnings: parseInt(summaryLine?.match(/(\d+) warnings/)?.[1] || "0", 10),
		parseErrors: parseInt(summaryLine?.match(/(\d+) parse errors/)?.[1] || "0", 10),
	}

	return {
		summary,
		details: { errors, warnings, parseErrors },
	}
}

const processLintResult = async (editor: Editor) => {
	const code = editor.input

	try {
		const result = await invoke<string>("lint_code", { luaCode: code })
		const parsedResult = parseLintResult(result)

		console.log("Parsed Lint Result:", parsedResult)
		toast.success("Lint result parsed successfully")

		return parsedResult
	} catch (error) {
		console.log("Error processing lint result:", error)
		toast.error("Failed to process lint result")
		return null
	}
}

export { processLintResult }
