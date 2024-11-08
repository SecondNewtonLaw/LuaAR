<template>
	<v-row v-if="reviews?.length">
		<v-col v-for="review in reviews" :key="review.url" cols="12" sm="6" md="4" class="review-card">
			<ReviewCard :review="review" />
		</v-col>
	</v-row>
	<v-alert v-else type="info"> No reviews found. </v-alert>
</template>

<script lang="ts" setup>
const props = defineProps<{
	reviews?: Review[]
}>()
</script>

<style scoped>
.review-card {
	cursor: pointer;
}
</style>
