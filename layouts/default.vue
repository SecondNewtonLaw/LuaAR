<template>
	<div class="container">
		<header>
			<v-toolbar>
				<v-toolbar-title>Desktop Menu</v-toolbar-title>
				<v-spacer></v-spacer>
				<v-toolbar-items>
					<v-btn :to="{ name: 'index' }">Home</v-btn>
					<v-btn :to="{ name: 'reviews' }">Reviews</v-btn>
				</v-toolbar-items>
			</v-toolbar>
		</header>
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
