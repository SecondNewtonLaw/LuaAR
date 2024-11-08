<template>
	<v-row>
		<v-col cols="12" sm="6" md="4">
			<v-text-field v-model="search" label="Search" hint="Search by userid, app id and title" persistent-hint />
		</v-col>
		<v-col cols="12" sm="6" md="4">
			<!-- <v-date-picker v-model="startDate"></v-date-picker> -->
		</v-col>
		<v-col cols="12" sm="6" md="4">
			<!-- <v-date-picker v-model="endDate"></v-date-picker> -->
		</v-col>
	</v-row>
	<v-row v-if="filteredReviews.length">
		<v-col v-for="review in filteredReviews" :key="review.url" cols="12" sm="6" md="4" class="review-card">
			<ReviewCard :review="review" />
		</v-col>
	</v-row>
	<v-alert v-else type="info"> No reviews found. </v-alert>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"

const props = defineProps<{
	reviews?: Review[]
}>()

const search = ref("")
const startDate = ref("")
const endDate = ref("")

const filteredReviews = computed(() => {
	if (!props.reviews) return []
	return props.reviews.filter((review) => {
		const matchesSearch = [review.user_id, review.title, review.url].some((field) =>
			field.toLowerCase().includes(search.value.toLowerCase())
		)
		const matchesStartDate = !startDate.value || new Date(review.created_at) >= new Date(startDate.value)
		const matchesEndDate = !endDate.value || new Date(review.created_at) <= new Date(endDate.value)
		return matchesSearch && matchesStartDate && matchesEndDate
	})
})
</script>

<style scoped>
.review-card {
	cursor: pointer;
}
</style>
