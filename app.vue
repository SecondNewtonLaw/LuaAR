<template>
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
	<VSonner :duration="2500" position="bottom-right" />
</template>

<script setup lang="ts">
import { toast, VSonner } from "vuetify-sonner"
import "vuetify-sonner/style.css"
const reviewStore = useReviewStore()

const title = "AR Atlas"
useHead({
	titleTemplate: (titleChunk) => {
		return titleChunk ? `${titleChunk} - ${title}` : title
	},
})

onMounted(reviewStore.loadReviews)

import { relaunch } from "@tauri-apps/plugin-process"
import { check } from "@tauri-apps/plugin-updater"

try {
	const update = await check()
	if (update) {
		console.log(`found update ${update.version} from ${update.date} with notes ${update.body}`)
		let downloaded = 0
		let contentLength = 0
		// alternatively we could also call update.download() and update.install() separately
		await update.downloadAndInstall((event) => {
			switch (event.event) {
				case "Started":
					contentLength = event.data.contentLength || 0
					console.log(`started downloading ${event.data.contentLength} bytes`)
					break
				case "Progress":
					downloaded += event.data.chunkLength || 0
					console.log(`downloaded ${downloaded} from ${contentLength}`)
					break
				case "Finished":
					console.log("download finished")
					break
			}
		})

		console.log("update installed")
		await relaunch()
	}
} catch (error) {
	console.log("failed to check for updates", error)
	toast.error("Failed to check for updates")
}
</script>
