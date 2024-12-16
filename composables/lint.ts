import { invoke } from "@tauri-apps/api/core"
import { toast } from "vuetify-sonner"

export interface LintSummary {
	errors: number
	warnings: number
	parseErrors: number
}

export interface LintDetailItem {
	type: "error" | "warning" | "parse_error"
	message: string
	lineNumber: number | null
	code: string | null
}

export interface LintDetails {
	errors: LintDetailItem[]
	warnings: LintDetailItem[]
	parseErrors: LintDetailItem[]
}

export interface LintSummary {
	errors: number
	warnings: number
	parseErrors: number
}

export interface LintResult {
	summary: LintSummary
	details: LintDetails
}

const parseLintResult = (result: string): LintResult => {
	const errors: LintDetailItem[] = []
	const warnings: LintDetailItem[] = []
	const parseErrors: LintDetailItem[] = []

	const lines = result.split("\n")
	console.log(result)
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
		} else if (line.includes("┌─")) {
			// Extract line number and column (e.g., -:29:7)
			const match = line.match(/-:(\d+):(\d+)/)
			if (match && currentError) {
				currentError.lineNumber = parseInt(match[1], 10) // Get the line number
			}
		} else if (line.includes("│") && i + 1 < lines.length) {
			// Look ahead to the next line for the actual code
			const codeLineMatch = lines[i + 1].match(/^\d+\s\│\s(.*)/)
			if (codeLineMatch && currentError) {
				currentError.code = codeLineMatch[1].trim() // Extract and trim the code
				i++ // Skip the next line since it's already processed
			}
		} else if (currentError) {
			// Push the current error or warning to the respective array
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

	const summary: LintSummary = {
		errors: errors.length,
		warnings: warnings.length,
		parseErrors: parseErrors.length,
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
