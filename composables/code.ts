const stripInput = (input: string) =>
	input
		.replace(/--\[\[[\s\S]*?\]\]/g, "")
		.replace(/--.*$/gm, "")
		.split("\n")
		.filter((line) => line.trim() !== "")
		.join("\n")

const stripLoggingStatements = (input: string) => input.replace(/^.*(print|warn|error)\(.*\).*\n?/gm, "")
const countWhitelines = (input: string) => input.split("\n").filter((line) => line.trim() === "").length
const countComments = (input: string) => input.match(/--\[\[[\s\S]*?\]\]|--.*$/gm)?.length || 0
const countLogs = (input: string) => input.match(/^.*(print|warn|error)\(.*\).*\n?/gm)?.length || 0
export { countComments, countLogs, countWhitelines, stripInput, stripLoggingStatements }
