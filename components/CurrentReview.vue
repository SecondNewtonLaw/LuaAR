<template>
	<h2>Current Review</h2>
	<v-form>
		<v-text-field
			label="Title"
			v-model="reviewStore.currentReview.title"
			:rules="[(v) => !!v || 'Title is required']"
		></v-text-field>
		<v-text-field
			label="URL"
			v-model="reviewStore.currentReview.url"
			:rules="[
				(v) => !!v || 'URL is required',
				(v) => /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(v) || 'Must be a valid URL',
				(v) => v.includes('hiddendevs.com') || 'URL must be from hiddendevs.com domain',
			]"
		></v-text-field>
		<v-text-field
			label="User ID"
			v-model="reviewStore.currentReview.user_id"
			:rules="[(v) => !!v || 'User ID is required']"
		></v-text-field>
	</v-form>
</template>

<script lang="ts" setup>
const reviewStore = useReviewStore()
</script>
