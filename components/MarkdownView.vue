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
				return hljs.highlight(str, { language: lang }).value
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
</style>
