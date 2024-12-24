<template>
	<v-container fluid height="100vh" class="d-flex flex-column">
		<AppHeader />
		<main>
			<slot />
		</main>
		<v-spacer />
		<v-footer color="transparent" class="align-end">
			<v-row class="d-flex justify-space-between">
				<v-spacer />
				<v-col cols="auto">
					<v-chip color="primary" label> Version: {{ settingsStore.version }} </v-chip>
				</v-col>
			</v-row>
		</v-footer>
	</v-container>
</template>

<script lang="ts" setup>
const settingsStore = useSettingsStore()
</script>

<style lang="scss" scoped>
// .container {
// 	display: flex;
// 	flex-direction: column;
// 	min-height: 100vh;
// 	max-width: 90rem;
// 	margin: 0 auto;
// 	padding: 0 1rem;
// }
</style>
