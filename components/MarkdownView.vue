<template>
	<div>
		<div v-html="renderedMarkdown"></div>
	</div>
</template>

<script lang="ts" setup>
import hljs from "highlight.js"
import MarkdownIt from "markdown-it"
const md = new MarkdownIt({
	html: false, // Enable HTML tags in source
	xhtmlOut: false, // Use '/' to close single tags (<br />)
	breaks: false, // Convert '\n' in paragraphs into <br>
	langPrefix: "language-", // CSS language prefix for fenced blocks
	linkify: true, // autoconvert URL-like texts to links
	typographer: true, // Enable smartypants and other sweet transforms
	highlight: function (str, lang) {
		console.log(str, lang)
		if (lang && hljs.getLanguage(lang)) {
			try {
				const highlighted = hljs.highlight(str, { language: lang }).value
				const lines = highlighted
					.split("\n")
					.map((line, index) => `<span class="line-number">${index + 1}</span>${line}`)
				return `<div class="code-block">${lines.join("\n")}</div>`
			} catch (e) {
				console.error(e)
			}
		}

		return "" // use external default escaping
	},
})

const content = defineModel<string>("content")
const renderedMarkdown = computed(() => md.render(content?.value ?? ""))
</script>

<style>
textarea {
	width: 100%;
	margin-bottom: 20px;
}

.code-block {
	position: relative;
	padding-left: 3em;
}

.line-number {
	position: absolute;
	left: 0;
	width: 2em;
	text-align: right;
	padding-right: 0.5em;
	user-select: none;
	opacity: 0.5;
}
</style>
