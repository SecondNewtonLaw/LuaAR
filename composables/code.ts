const syntaxConfig: Record<
	string,
	{
		singleLineComment: string
		multiLineCommentStart?: string
		multiLineCommentEnd?: string
		stringDelimiters: string[]
	}
> = {
	lua: {
		singleLineComment: "--",
		multiLineCommentStart: "--[[",
		multiLineCommentEnd: "]]",
		stringDelimiters: ['"', "'", "`"],
	},
	typescript: {
		singleLineComment: "//",
		multiLineCommentStart: "/*",
		multiLineCommentEnd: "*/",
		stringDelimiters: ['"', "'", "`"],
	},
	html: {
		singleLineComment: "",
		multiLineCommentStart: "<!--",
		multiLineCommentEnd: "-->",
		stringDelimiters: ['"', "'"],
	},
	css: {
		singleLineComment: "",
		multiLineCommentStart: "/*",
		multiLineCommentEnd: "*/",
		stringDelimiters: ['"', "'"],
	},
	json: {
		singleLineComment: "",
		multiLineCommentStart: "/*",
		multiLineCommentEnd: "*/",
		stringDelimiters: ['"', "'"],
	},
	python: {
		singleLineComment: "#",
		multiLineCommentStart: '"""',
		multiLineCommentEnd: '"""',
		stringDelimiters: ['"', "'"],
	},
}

const stripInput = (editor: Editor): string => {
	const config = syntaxConfig[editor.lang || "lua"]
	const input = editor.input
	let result = ""
	let inString = false
	let stringDelimiter = ""
	let inComment = false
	let inLongComment = false

	for (let i = 0; i < input.length; i++) {
		const currentChar = input[i]
		const nextChar = input[i + 1]

		// Start of a comment
		if (
			!inString &&
			!inComment &&
			currentChar === config.singleLineComment[0] &&
			nextChar === config.singleLineComment[1]
		) {
			// Check if it's a multi-line comment
			if (
				config.multiLineCommentStart &&
				input.slice(i, i + config.multiLineCommentStart.length) === config.multiLineCommentStart
			) {
				inComment = true
				inLongComment = true
				i += config.multiLineCommentStart.length - 1 // Skip multi-line comment start
				continue
			} else {
				// It's a single-line comment
				inComment = true
				inLongComment = false
				i += config.singleLineComment.length - 1 // Skip single-line comment start
				continue
			}
		}

		// Inside a comment
		if (inComment) {
			if (inLongComment) {
				// End of multi-line comment
				if (
					config.multiLineCommentEnd &&
					input.slice(i, i + config.multiLineCommentEnd.length) === config.multiLineCommentEnd
				) {
					inComment = false
					inLongComment = false
					i += config.multiLineCommentEnd.length - 1 // Skip multi-line comment end
				}
			} else {
				// End of single-line comment
				if (currentChar === "\n") {
					inComment = false
					result += currentChar // Preserve the newline
				}
			}
			continue // Skip all characters inside comments
		}

		// Handle entering and exiting strings
		if (!inString) {
			if (config.stringDelimiters.includes(currentChar)) {
				inString = true
				stringDelimiter = currentChar
				result += currentChar
				continue
			}
		} else {
			if (currentChar === stringDelimiter) {
				inString = false
			} else if (currentChar === "\\" && nextChar === stringDelimiter) {
				// Handle escaped delimiters
				result += currentChar // Add the escape character
				i += 1 // Skip the escaped delimiter
			}
			result += currentChar
			continue
		}

		// Handle Lua long string literals [[...]]
		if (currentChar === "[" && nextChar === "[") {
			inComment = false // Ensure we're not inside a comment
			result += currentChar + nextChar
			i += 1 // Skip the second "["
			continue
		} else if (currentChar === "]" && nextChar === "]") {
			result += currentChar + nextChar
			i += 1 // Skip the second "]"
			continue
		}

		// Add character to result if not in a comment
		result += currentChar
	}

	// Remove empty lines
	return result
		.split("\n")
		.filter((line) => line.trim() !== "")
		.join("\n")
}

const logFunctions: Record<string, string[]> = {
	lua: ["print", "warn", "error"],
	typescript: ["console.log", "console.warn", "console.error"],
}

const getLogRegex = (lang: string = "lua") => {
	const functions = logFunctions[lang]
	if (!functions) return
	return new RegExp(`^.*(${functions.join("|")})\\(.*\\).*\n?`, "gm")
}

const stripLoggingStatements = (input: string, lang: string = "lua") => {
	const regex = getLogRegex(lang)
	if (!regex) return input
	return input.replace(regex, "")
}

const countWhitelines = (editor: Editor) => editor.input.split("\n").filter((line) => line.trim() === "").length

const countComments = (editor: Editor) => {
	const config = syntaxConfig[editor.lang || "lua"]
	const input = editor.input
	let inString = false
	let stringDelimiter = ""
	let inLongString = false
	let inComment = false
	let commentCount = 0

	for (let i = 0; i < input.length; i++) {
		const currentChar = input[i]
		const nextChar = input[i + 1]

		// Start of a long comment
		if (
			!inString &&
			!inLongString &&
			currentChar === config.singleLineComment[0] &&
			nextChar === config.singleLineComment[1] &&
			config.multiLineCommentStart &&
			input.slice(i, i + config.multiLineCommentStart.length) === config.multiLineCommentStart
		) {
			inComment = true
			commentCount++
			i += config.multiLineCommentStart.length - 1 // Skip ahead to avoid counting nested or adjacent comments
			continue
		}

		// End of a long comment
		if (
			inComment &&
			config.multiLineCommentEnd &&
			input.slice(i, i + config.multiLineCommentEnd.length) === config.multiLineCommentEnd
		) {
			inComment = false
			i += config.multiLineCommentEnd.length - 1
			continue
		}

		// Start of a single-line comment
		if (
			!inString &&
			!inLongString &&
			!inComment &&
			currentChar === config.singleLineComment[0] &&
			nextChar === config.singleLineComment[1]
		) {
			inComment = true
			commentCount++
			i += config.singleLineComment.length - 1 // Skip the next dash to avoid counting it twice
			continue
		}

		// End of a single-line comment at the end of the line
		if (inComment && currentChar === "\n") {
			inComment = false
			continue
		}

		// Handle entering and exiting strings
		if (!inComment && !inLongString) {
			if (!inString && config.stringDelimiters.includes(currentChar)) {
				inString = true
				stringDelimiter = currentChar
			} else if (inString && currentChar === stringDelimiter) {
				inString = false
			}
		}

		// Start of a Lua long string ([[...]])
		if (!inComment && !inString && currentChar === "[" && nextChar === "[") {
			inLongString = true
			i += 1 // Skip ahead for opening brackets
		} else if (inLongString && currentChar === "]" && nextChar === "]") {
			inLongString = false
			i += 1 // Skip ahead for closing brackets
		}
	}

	return commentCount
}

const countLogs = (editor: Editor) => {
	const regex = getLogRegex(editor.lang)
	if (!regex) return 0
	return editor.input.match(regex)?.length || 0
}

export { countComments, countLogs, countWhitelines, stripInput, stripLoggingStatements }
