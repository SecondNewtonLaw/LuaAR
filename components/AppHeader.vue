<template>
	<header class="mb-4">
		<v-toolbar color="transparent" floating elevation="10">
			<v-toolbar-title>
				<v-btn variant="text" class="font-weight-bold text-h5" :active="false" :to="{ name: 'index' }"
					>AR Atlas</v-btn
				>
			</v-toolbar-title>
			<v-spacer></v-spacer>
			<v-toolbar-items>
				<v-btn icon="mdi-home-outline" :to="{ name: 'index' }" />
				<v-btn icon="mdi-comment-text-outline" :to="{ name: 'reviews' }" />
				<!-- <v-btn icon="mdi-file-document-outline" :to="{ name: 'HD' }" /> -->
				<v-btn icon="mdi-shield-account-outline" :to="{ name: 'moderation' }" />
				<v-btn icon="mdi-cog" @click="openSettings = true" />
				<v-tooltip location="bottom">
					<template #activator="{ props }">
						<v-btn
							v-bind="props"
							icon="mdi-cloud-download-outline"
							@click="updateApplication"
							v-if="update" />
					</template>
					Update Available {{ update?.version }}
				</v-tooltip>
			</v-toolbar-items>
		</v-toolbar>

		<SettingsDialog v-model="openSettings" />
	</header>
</template>

<script lang="ts" setup>
import { relaunch } from "@tauri-apps/plugin-process"
import { check, Update } from "@tauri-apps/plugin-updater"
import { toast } from "vuetify-sonner"

const openSettings = ref(false)
const update = ref<Update | null>(null)
try {
	update.value = await check()
	console.log("update", update.value)
	if (update.value) {
		console.log(`found update ${update.value.version} from ${update.value.date} with notes ${update.value.body}`)
	}
} catch (error) {
	console.log("failed to check for updates", error)
	toast.error("Failed to check for updates")
}

const updateApplication = async () => {
	if (!update.value) {
		console.log("no update available")
		return
	}
	try {
		let downloaded = 0
		let contentLength = 0
		// alternatively we could also call update.download() and update.install() separately
		await update.value.downloadAndInstall((event) => {
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
	} catch (error) {
		console.log("failed to update", error)
		toast.error("Failed to update")
	}
}
</script>

<style scoped></style>
