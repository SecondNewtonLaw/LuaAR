<template>
	<v-container fluid>
		<AppHeader />
		<main>
			<slot />
		</main>
		<footer>
			{{ app.getVersion() }}
		</footer>
	</v-container>
</template>

<script lang="ts" setup>
import { app } from "@tauri-apps/api"
const theme = useTheme()
const darkMode = ref(false)

watch(darkMode, (value) => {
	theme.global.name.value = value ? "dark" : "light"
})
onMounted(async () => {
	darkMode.value = theme.current.value.dark
})
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
