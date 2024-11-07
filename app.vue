<template>
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
</template>

<script setup lang="ts">
const title = "Lua Application Reader Copilot"
useHead({
	titleTemplate: (titleChunk) => {
		return titleChunk ? `${titleChunk} - ${title}` : title
	},
})
</script>
