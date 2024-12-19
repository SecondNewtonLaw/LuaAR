<template>
	<div>
		<v-card ref="card">
			<v-card-title class="d-flex align-center pa-2 pl-4">
				<!-- Back icon to go to the previous review -->
				Current Review {{ reviewStore.isTouched ? "*" : "" }}
				<!-- Show adding or editing according to if id is set label with tooltip -->
				<v-chip color="primary" label class="ml-2">
					{{ reviewStore.currentReview.id ? "Editing" : "Adding" }}
					<v-tooltip activator="parent" location="bottom" v-if="reviewStore.currentReview.id">
						{{ reviewStore.currentReview.id }}
					</v-tooltip>
				</v-chip>
				<v-spacer />
				<v-btn color="primary" appendIcon="mdi-plus" @click="emits('new')">NEW REVIEW</v-btn>
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
					<v-row class="align-center">
						<v-col>
							<v-combobox
								label="Title"
								clearable
								density="comfortable"
								variant="solo-filled"
								v-model="reviewStore.currentReview.title"
								@update:search="titleSelected"
								:items="existingTitles"></v-combobox>
						</v-col>
						<v-col cols="auto" class="mb-5">
							<!-- Approved -->
							<v-btn
								:variant="reviewStore.currentReview.approved ? 'elevated' : 'tonal'"
								@click="reviewStore.currentReview.approved = !reviewStore.currentReview.approved"
								:color="reviewStore.currentReview.approved ? 'success' : 'error'">
								{{ reviewStore.currentReview.approved ? "Approved" : "Declined " }}
							</v-btn>
						</v-col>
					</v-row>

					<v-text-field
						label="URL"
						variant="solo-filled"
						density="comfortable"
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
						density="comfortable"
						variant="solo-filled"
						:rules="[
							(v) => !!v || 'User ID is required',
							(v) => !isNaN(Number(v)) || 'User ID must be a number',
						]"
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
								density="comfortable"
								auto-grow
								v-model="reviewStore.currentReview.review">
							</v-textarea>
						</v-col>
						<v-col v-if="previousReview" cols="4" class="position-relative">
							<v-textarea
								:label="`Previous Review (${new Date(previousReview.created_at).toLocaleString()})`"
								auto-grow
								density="comfortable"
								variant="solo-filled"
								disabled
								:model-value="previousReview.review"
								readonly>
							</v-textarea>
							<v-btn
								v-if="personalReviews"
								icon="mdi-history"
								density="comfortable"
								:color="
									new Date(previousReview.created_at) > new Date(reviewStore.currentReview.created_at)
										? 'primary'
										: 'default'
								"
								class="position-absolute top-0 right-0 mt-4 mr-4"
								@click="
									previousReviewIndex =
										previousReviewIndex === personalReviews.length - 1 ? 0 : previousReviewIndex + 1
								">
							</v-btn>
						</v-col>
					</v-row>

					<!-- evidence multiple images -->
					<v-file-input
						clearable
						multiple
						density="comfortable"
						chips
						variant="solo-filled"
						prepend-icon=""
						append-inner-icon="mdi-image-multiple"
						label="Evidence"
						v-model="reviewStore.evidence"></v-file-input>

					<ImageSlider v-model="reviewStore.currentReview.evidence" />
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

const emits = defineEmits<{ new: [] }>()
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

const previousReviewIndex = ref(0)
const personalReviews = computed(() =>
	reviewStore.reviews?.filter(
		(review) => review.user_id === reviewStore.currentReview.user_id && review.id !== reviewStore.currentReview.id
	)
)
const previousReview = computed(
	() =>
		personalReviews.value?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[
			previousReviewIndex.value
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
