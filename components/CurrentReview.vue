<template>
	<v-card ref="card">
		<v-card-title>
			Current Review
			<!-- Show adding or editing according to if id is set label with tooltip -->
			<v-chip color="primary" label>
				{{ reviewStore.currentReview.id ? "Editing" : "Adding" }}
				<v-tooltip activator="parent" location="bottom" v-if="reviewStore.currentReview.id">
					{{ reviewStore.currentReview.id }}
				</v-tooltip>
			</v-chip>
		</v-card-title>
		<v-card-item>
			<v-form validate-on="input lazy" ref="form">
				<v-combobox
					label="Title"
					v-model="reviewStore.currentReview.title"
					:rules="[(v) => !!v || 'Title is required']"
					@update:search="titleSelected"
					:items="existingTitles"></v-combobox>
				<v-text-field
					label="URL"
					v-model="reviewStore.currentReview.url"
					:rules="[
						(v) => !!v || 'URL is required',
						(v) => /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(v) || 'Must be a valid URL',
						(v) => v.includes('hiddendevs.com') || 'URL must be from hiddendevs.com domain',
					]"></v-text-field>

				<v-combobox
					label="User ID"
					v-model="reviewStore.currentReview.user_id"
					@update:search="userIdSelected"
					:items="existingUserIds"
					:rules="[(v) => !!v || 'User ID is required']"></v-combobox>

				<v-textarea
					label="Review"
					auto-grow
					v-model="reviewStore.currentReview.review"
					:rules="[(v) => !!v || 'Review is required']"></v-textarea>

				<!-- evidence multiple images -->
				<v-file-input multiple chips counter label="Evidence" v-model="reviewStore.evidence"></v-file-input>

				<div class="d-flex flex-row mb-6">
					<v-img
						:src="base64"
						:max-height="200"
						:max-width="200"
						class="ma-2 pa-2"
						v-for="base64 in reviewStore.currentReview.evidence"
						:key="base64">
					</v-img>
				</div>
			</v-form>
		</v-card-item>
	</v-card>
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

const card = ref<{
	$el: HTMLDivElement
} | null>(null)

const handlePaste = (event: ClipboardEvent) => {
	const items = event.clipboardData?.items
	if (!items) return
	for (const item of items) {
		if (item.kind === "file") {
			const blob = item.getAsFile()
			const reader = new FileReader()
			reader.onload = (e) => {
				const base64 = e.target?.result as string
				reviewStore.currentReview.evidence.push(base64)
			}
			if (blob) {
				reader.readAsDataURL(blob)
			}
		}
	}
}

onMounted(() => {
	if (!card.value) return
	const element = card.value.$el
	if (!element) return
	element.addEventListener("paste", handlePaste)
})

onUnmounted(() => {
	if (!card.value) return
	const element = card.value.$el
	if (!element) return
	element.removeEventListener("paste", handlePaste)
})
</script>
