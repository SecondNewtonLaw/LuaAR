const stripInput = (input: string) =>
	input
		.replace(/--\[\[[\s\S]*?\]\]/g, "")
		.replace(/--.*$/gm, "")
		.split("\n")
		.filter((line) => line.trim() !== "")
		.join("\n")

const countWhitelines = (input: string) => input.split("\n").filter((line) => line.trim() === "").length
const countComments = (input: string) => input.match(/--\[\[[\s\S]*?\]\]|--.*$/gm)?.length || 0
export { countComments, countWhitelines, stripInput }
