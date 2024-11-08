<template>
	<div class="container">
		<AppHeader />
		<main>
			<slot />
		</main>
		<footer></footer>
	</div>
</template>

<script lang="ts" setup>
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
.container {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	max-width: 90rem;
	margin: 0 auto;
	padding: 0 1rem;
}
</style>
