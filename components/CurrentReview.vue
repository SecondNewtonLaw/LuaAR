<template>
	<h2>
		Current Review
		<!-- Show adding or editing according to if id is set label with tooltip -->
		<v-chip color="primary" label>
			{{ reviewStore.currentReview.id ? "Editing" : "Adding" }}
			<v-tooltip activator="parent" location="bottom" v-if="reviewStore.currentReview.id">
				{{ reviewStore.currentReview.id }}
			</v-tooltip>
		</v-chip>
	</h2>
	<v-form validate-on="input lazy" ref="form">
		<v-combobox
			label="Title"
			v-model="reviewStore.currentReview.title"
			:rules="[(v) => !!v || 'Title is required']"
			@update:search="titleSelected"
			:items="existingTitles"
		></v-combobox>
		<v-text-field
			label="URL"
			v-model="reviewStore.currentReview.url"
			:rules="[
				(v) => !!v || 'URL is required',
				(v) => /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(v) || 'Must be a valid URL',
				(v) => v.includes('hiddendevs.com') || 'URL must be from hiddendevs.com domain',
			]"
		></v-text-field>

		<v-combobox
			label="User ID"
			v-model="reviewStore.currentReview.user_id"
			@update:search="userIdSelected"
			:items="existingUserIds"
			:rules="[(v) => !!v || 'User ID is required']"
		></v-combobox>

		<v-textarea
			label="Review"
			v-model="reviewStore.currentReview.review"
			:rules="[(v) => !!v || 'Review is required']"
		></v-textarea>
	</v-form>
</template>

<script lang="ts" setup>
const reviewStore = useReviewStore()
const existingUserIds = computed(() => [...new Set(reviewStore.reviews?.map((review) => review.user_id) || [])])
const existingTitles = computed(() => [...new Set(reviewStore.reviews?.map((review) => review.title) || [])])
const form = ref<HTMLFormElement | null>(null)

defineExpose({ form })
const userIdSelected = () => {
	const userId = reviewStore.currentReview.user_id
	if (!userId) return
	const review = reviewStore.reviews?.find((review) => review.user_id === userId)
	if (review) {
		reviewStore.currentReview.title = review.title
	}
}
const titleSelected = () => {
	const title = reviewStore.currentReview.title
	if (!title) return
	const review = reviewStore.reviews?.find((review) => review.title === title)
	if (review) {
		reviewStore.currentReview.user_id = review.user_id
	}
}
</script>
