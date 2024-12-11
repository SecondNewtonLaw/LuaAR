const stripInput = (input: string): string => {
	let result = ""
	let inString = false
	let stringDelimiter = ""
	let inComment = false
	let inLongComment = false

	for (let i = 0; i < input.length; i++) {
		const currentChar = input[i]
		const nextChar = input[i + 1]

		// Start of a comment
		if (!inString && !inComment && currentChar === "-" && nextChar === "-") {
			// Check if it's a multi-line comment
			if (input.slice(i + 2, i + 4) === "[[") {
				inComment = true
				inLongComment = true
				i += 3 // Skip "--[["
				continue
			} else {
				// It's a single-line comment
				inComment = true
				inLongComment = false
				i += 1 // Skip "--"
				continue
			}
		}

		// Inside a comment
		if (inComment) {
			if (inLongComment) {
				// End of multi-line comment
				if (currentChar === "]" && nextChar === "]") {
					inComment = false
					inLongComment = false
					i += 1 // Skip "]]"
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
			if (currentChar === '"' || currentChar === "'" || currentChar === "`") {
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

const stripLoggingStatements = (input: string) => input.replace(/^.*(print|warn|error)\(.*\).*\n?/gm, "")
const countWhitelines = (input: string) => input.split("\n").filter((line) => line.trim() === "").length
const countComments = (input: string) => {
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
			currentChar === "-" &&
			nextChar === "-" &&
			input.slice(i + 2, i + 4) === "[["
		) {
			inComment = true
			commentCount++
			i += 3 // Skip ahead to avoid counting nested or adjacent comments
			continue
		}

		// End of a long comment
		if (inComment && input.slice(i, i + 2) === "]]") {
			inComment = false
			i += 1
			continue
		}

		// Start of a single-line comment
		if (!inString && !inLongString && !inComment && currentChar === "-" && nextChar === "-") {
			inComment = true
			commentCount++
			i += 1 // Skip the next dash to avoid counting it twice
			continue
		}

		// End of a single-line comment at the end of the line
		if (inComment && currentChar === "\n") {
			inComment = false
			continue
		}

		// Handle entering and exiting strings
		if (!inComment && !inLongString) {
			if (!inString && (currentChar === '"' || currentChar === "'" || currentChar === "`")) {
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

const countLogs = (input: string) => input.match(/^.*(print|warn|error)\(.*\).*\n?/gm)?.length || 0
export { countComments, countLogs, countWhitelines, stripInput, stripLoggingStatements }
