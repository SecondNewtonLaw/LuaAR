const stripInput = (input: string) => {
	let result = ""
	let inString = false
	let stringDelimiter = ""
	let inLongString = false
	let inComment = false

	for (let i = 0; i < input.length; i++) {
		const currentChar = input[i]
		const nextChar = input[i + 1]

		// Check for the start of a long comment
		if (
			!inString &&
			!inLongString &&
			currentChar === "-" &&
			nextChar === "-" &&
			input.slice(i + 2, i + 4) === "[["
		) {
			inComment = true
			i += 3
			continue
		}

		// Check for the end of a long comment
		if (inComment && input.slice(i, i + 2) === "]]") {
			inComment = false
			i += 1
			continue
		}

		// Handle single-line comments
		if (!inString && !inLongString && !inComment && currentChar === "-" && nextChar === "-") {
			inComment = true
			i += 1
			continue
		}

		// End single-line comment at the end of the line
		if (inComment && currentChar === "\n") {
			inComment = false
			result += currentChar
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

		// Handle Lua long string start ([[...]])
		if (!inComment && !inString && currentChar === "[" && nextChar === "[") {
			inLongString = true
			i += 1
		} else if (inLongString && currentChar === "]" && nextChar === "]") {
			inLongString = false
			i += 1
		}

		// Add the character to the result if not in a comment
		if (!inComment) result += currentChar
	}

	// Filter out empty lines
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
