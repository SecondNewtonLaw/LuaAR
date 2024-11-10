<template>
	<v-container>
		<v-row>
			<v-col cols="12">
				<ReviewList :reviews="reviews" />
			</v-col>
		</v-row>
	</v-container>
</template>

<script lang="ts" setup>
const reviewStore = useReviewStore()
const reviews = computed(() => reviewStore.reviews)
const refreshReviews = reviewStore.loadReviews

onMounted(refreshReviews)
</script>

<style scoped>
.v-container {
	margin-top: 20px;
}
.review-card {
	cursor: pointer;
}
</style>
