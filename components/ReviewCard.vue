<template>
	<v-card @click.stop="selectReview">
		<v-card-title>{{ review.title }}</v-card-title>
		<v-card-subtitle>Created at: {{ formatDate(review.created_at) }}</v-card-subtitle>
		<v-card-subtitle>Updated at: {{ formatDate(review.updated_at) }}</v-card-subtitle>
		<v-card-subtitle>User ID: {{ review.user_id }}</v-card-subtitle>
		<v-card-actions>
			<v-btn color="primary" :href="review.url" target="_blank" @click.stop
				>{{ review.user_id }} Application</v-btn
			>
		</v-card-actions>
		<v-btn icon @click.stop="removeReview" class="top-right-icon">
			<v-icon color="red">mdi-trash-can</v-icon>
		</v-btn>
	</v-card>
</template>

<style scoped>
.top-right-icon {
	position: absolute;
	top: 10px;
	right: 10px;
}

a {
	text-decoration: underline;
}
</style>

<script lang="ts" setup>
const reviewStore = useReviewStore()
const router = useRouter()
const props = defineProps<{
	review: Review
}>()

function selectReview() {
	reviewStore.loadReview(props.review)
	router.push("/")
}

function formatDate(date: string): string {
	return new Date(date).toLocaleDateString()
}

function removeReview() {
	reviewStore.removeReview(props.review)
}
</script>
