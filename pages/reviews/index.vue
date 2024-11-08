<template>
	<v-container>
		<v-row>
			<v-col cols="12">
				<v-card>
					<v-card-title>
						My Reviews
						<v-spacer></v-spacer>
						<v-btn @click="refreshReviews" icon>
							<v-icon>mdi-refresh</v-icon>
						</v-btn>
					</v-card-title>
					<v-card-text>
						<ReviewList :reviews="reviews" />
					</v-card-text>
				</v-card>
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
