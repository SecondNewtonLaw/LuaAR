<template>
	<v-card ref="card">
		<v-card-title>
			<!-- Back icon to go to the previous review -->
			Current Review
			<!-- Show adding or editing according to if id is set label with tooltip -->
			<v-chip color="primary" label>
				{{ reviewStore.currentReview.id ? "Editing" : "Adding" }}
				<v-tooltip activator="parent" location="bottom" v-if="reviewStore.currentReview.id">
					{{ reviewStore.currentReview.id }}
				</v-tooltip>
			</v-chip>
		</v-card-title>
		<v-card-subtitle>
			{{
				reviewStore.currentReview.created_at
					? `Created at: ${new Date(reviewStore.currentReview.created_at).toLocaleString()}`
					: "New Review"
			}}
			<br />
			{{
				reviewStore.currentReview.updated_at
					? `Updated at: ${new Date(reviewStore.currentReview.updated_at).toLocaleString()}`
					: ""
			}}
		</v-card-subtitle>
		<v-card-item>
			<v-form validate-on="input lazy" ref="form">
				<v-combobox
					label="Title"
					clearable
					variant="solo-filled"
					v-model="reviewStore.currentReview.title"
					@update:search="titleSelected"
					:items="existingTitles"></v-combobox>
				<v-text-field
					label="URL"
					variant="solo-filled"
					append-inner-icon="mdi-link"
					placeholder="https://hiddendevs.com/applications/1"
					clearable
					v-model="reviewStore.currentReview.url"
					:rules="[
						(v) => !v || /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(v) || 'Must be a valid URL',
						(v) => !v || v.includes('hiddendevs.com') || 'URL must be from hiddendevs.com domain',
					]"></v-text-field>

				<v-combobox
					label="User ID"
					clearable
					variant="solo-filled"
					v-model="reviewStore.currentReview.user_id"
					@update:search="userIdSelected"
					:items="existingUserIds" />

				<v-row>
					<v-col>
						<v-textarea
							label="Review"
							append-inner-icon="mdi-message-text"
							variant="solo-filled"
							auto-grow
							v-model="reviewStore.currentReview.review">
						</v-textarea>
					</v-col>
					<v-col v-if="previousReview" cols="4">
						<v-textarea
							label="Previous Review"
							auto-grow
							variant="solo-filled"
							disabled
							v-model="previousReview.review"
							readonly></v-textarea>
					</v-col>
				</v-row>

				<!-- evidence multiple images -->
				<v-file-input
					clearable
					multiple
					chips
					variant="solo-filled"
					prepend-icon=""
					append-inner-icon="mdi-image-multiple"
					counter
					label="Evidence"
					v-model="reviewStore.evidence"></v-file-input>

				<v-row justify="start">
					<v-col v-for="base64 in reviewStore.currentReview.evidence" :key="base64">
						<v-img :src="base64" :max-height="300" class="ma-2 pa-2"> </v-img>
					</v-col>
				</v-row>
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

const previousReview = computed(
	() =>
		reviewStore.reviews
			?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
			.filter((review) => review.user_id === reviewStore.currentReview.user_id)[
			reviewStore.currentReview.id ? 1 : 0
		]
)

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
