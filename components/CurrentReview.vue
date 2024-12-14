<template>
	<div>
		<v-card ref="card">
			<v-card-title>
				<!-- Back icon to go to the previous review -->
				Current Review {{ reviewStore.isTouched ? "*" : "" }}
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
						]">
						<template
							v-slot:append-inner
							v-if="
								reviewStore.currentReview.url &&
								/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(reviewStore.currentReview.url) &&
								reviewStore.currentReview.url.includes('hiddendevs.com')
							">
							<v-tooltip location="bottom">
								<template v-slot:activator="{ props }">
									<div v-bind="props" class="d-inline-block mr-2">
										<v-btn @click="scrape(reviewStore.currentReview.url)" disabled>Scrape</v-btn>
									</div>
								</template>
								<span>
									Scrape the URL for the code & allat
									<br />
									Currently disabled due to lack of skills.
								</span>
							</v-tooltip>
						</template>
					</v-text-field>

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
								ref="review-area"
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
								:model-value="previousReview.review"
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
						label="Evidence"
						v-model="reviewStore.evidence"></v-file-input>

					<v-row justify="start" class="mt-0">
						<v-col v-for="base64 in reviewStore.currentReview.evidence" :key="base64">
							<v-img :src="base64" width="auto" :style="{ width: 'auto' }" height="200"></v-img>
						</v-col>
					</v-row>
				</v-form>
			</v-card-item>
		</v-card>
		<DraggableTextarea v-if="showDraggable" v-model="reviewStore.currentReview.review" />
	</div>
</template>

<script lang="ts" setup>
const { scrape } = useScrape()
const reviewStore = useReviewStore()
const reviewArea = useTemplateRef("review-area")
const existingUserIds = computed(() => [...new Set(reviewStore.reviews?.map((review) => review.user_id) || [])])
const existingTitles = computed(() => [...new Set(reviewStore.reviews?.map((review) => review.title) || [])])
const form = useTemplateRef("form")

defineExpose({ form })
const userIdSelected = () => {
	const review = reviewStore.reviews?.find((review) => review.user_id === reviewStore.currentReview.user_id)
	if (review) {
		reviewStore.currentReview.title = review.title
	}
}
const titleSelected = () => {
	const review = reviewStore.reviews?.find((review) => review.title === reviewStore.currentReview.title)
	if (review) {
		reviewStore.currentReview.user_id = review.user_id
	}
}

const card = useTemplateRef("card")

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

const showDraggable = ref(false)

const observer = new IntersectionObserver(
	([entry]) => {
		showDraggable.value = !entry.isIntersecting
	},
	{ root: null, threshold: 0 }
)

onMounted(() => {
	if (reviewArea.value?.$el) {
		observer.observe(reviewArea.value.$el)
	}
	card.value?.$el?.addEventListener("paste", handlePaste)
})

onUnmounted(() => {
	observer.disconnect()
	card.value?.$el?.removeEventListener("paste", handlePaste)
})
</script>
