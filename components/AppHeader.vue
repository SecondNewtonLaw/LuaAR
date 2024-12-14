<template>
	<header class="mb-4">
		<v-toolbar color="transparent" floating elevation="10">
			<v-toolbar-title class="text-h6 font-weight-bold"> AR Atlas </v-toolbar-title>
			<v-spacer></v-spacer>
			<v-toolbar-items>
				<v-btn icon="mdi-home-outline" :to="{ name: 'index' }" />
				<v-btn icon="mdi-comment-text-outline" :to="{ name: 'reviews' }" />
				<!-- <v-btn icon="mdi-file-document-outline" :to="{ name: 'HD' }" /> -->
				<v-btn icon="mdi-shield-account-outline" :to="{ name: 'moderation' }" />
				<v-btn icon="mdi-cog" @click="openSettings = true" />
			</v-toolbar-items>
		</v-toolbar>

		<v-dialog v-model="openSettings" max-width="500">
			<v-card>
				<v-card-title class="headline">Settings</v-card-title>
				<v-card-text>
					<v-row>
						<v-col cols="12">
							<v-text-field
								label="Minimum LOC"
								v-model="settingsStore.loc"
								type="number"
								:rules="[
									(v) => !!v || 'Value is required',
									(v) => v >= 0 || 'Value must be greater than or equal to 0',
								]" />
						</v-col>

						<v-col cols="12">
							<v-select
								v-model="settingsStore.defaultLanguage"
								:items="settingsStore.languages"
								label="Default Language"
								:rules="[(v) => !!v || 'Value is required']" />
						</v-col>
					</v-row>
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn @click="openSettings = false">Close</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</header>
</template>

<script lang="ts" setup>
const openSettings = ref(false)
const settingsStore = useSettingsStore()
</script>

<style scoped></style>
