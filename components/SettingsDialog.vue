<template>
	<div>
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
	</div>
</template>

<script lang="ts" setup>
const openSettings = defineModel<boolean>()

const settingsStore = useSettingsStore()
</script>

<style></style>
