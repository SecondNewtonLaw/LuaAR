<template>
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
	<VSonner :duration="2500" position="bottom-right" />
</template>

<script setup lang="ts">
import { VSonner } from "vuetify-sonner"
import "vuetify-sonner/style.css"
const reviewStore = useReviewStore()

const title = "Lua Application Reader Copilot"
useHead({
	titleTemplate: (titleChunk) => {
		return titleChunk ? `${titleChunk} - ${title}` : title
	},
})

onMounted(reviewStore.loadReviews)

await callOnce(async () => {
	console.log("Hello from the server!")
})
</script>
