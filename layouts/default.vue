<template>
	<v-container fluid height="100vh" class="d-flex flex-column">
		<AppHeader />
		<main>
			<slot />
		</main>
	</v-container>
</template>

<script lang="ts" setup>
import { invoke } from "@tauri-apps/api/core"

async function quickSortReviews(
	reviews: Review[],
	sortBy: keyof Review = "created_at",
	ascending: boolean = true
): Promise<{ sortedReviews: Review[]; duration: string }> {
	try {
		const start = performance.now()
		const { 0: sortedReviews, 1: duration } = await invoke<[Review[], string]>("sort_reviews", {
			reviews,
			sortBy,
			ascending,
		})

		console.log(`${duration}`)
		console.log(`JS sorting took ${performance.now() - start}ms`)
		return { sortedReviews, duration }
	} catch (error) {
		console.error("Error in Rust sorting:", error)
		throw error
	}
}

// watch(
// 	() => useReviewStore().reviews,
// 	async (reviews) => {
// 		if (!reviews) return
// 		const { sortedReviews } = await quickSortReviews(reviews)

// 		console.log(sortedReviews)
// 	},
// 	{ immediate: true }
// )
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
