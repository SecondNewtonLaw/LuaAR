<template>
	<v-container fluid height="100vh" class="d-flex flex-column">
		<AppHeader />
		<main>
			<slot />
		</main>
	</v-container>
</template>

<script lang="ts" setup></script>

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
