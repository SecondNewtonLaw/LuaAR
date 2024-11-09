<template>
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
</template>

<script setup lang="ts">
const reviewStore = useReviewStore()
import * as monaco from "monaco-editor"

// Define a custom theme
monaco.editor.defineTheme("customTheme", {
	base: "vs-dark",
	inherit: true,
	colors: {},
	rules: [],
})

const title = "Lua Application Reader Copilot"
useHead({
	titleTemplate: (titleChunk) => {
		return titleChunk ? `${titleChunk} - ${title}` : title
	},
})

onMounted(reviewStore.loadReviews)
</script>
