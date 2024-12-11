<template>
	<v-row>
		<v-col cols="12">
			<ReviewList :reviews="reviews" />
		</v-col>
	</v-row>
</template>

<script lang="ts" setup>
const reviewStore = useReviewStore()
const reviews = computed(() => reviewStore.reviews)
</script>

<style scoped></style>
