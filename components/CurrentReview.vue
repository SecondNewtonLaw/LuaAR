<template>
	<div ref="card">
		<v-card>
			<v-card-title class="d-flex align-center pa-2 px-4">
				Current Review {{ reviewStore.isTouched ? "*" : "" }}
				<v-chip color="primary" label class="ml-2">
					{{ currentReview.id ? "Editing" : "Adding" }}
					<v-tooltip activator="parent" location="bottom" v-if="currentReview.id">
						{{ currentReview.id }}
					</v-tooltip>
				</v-chip>

				<v-spacer />
				<v-btn-group
					class="ga-2 position-absolute"
					density="comfortable"
					style="left: 50%; transform: translateX(-50%)">
					<v-btn
						:variant="currentReview.approved ? 'elevated' : 'tonal'"
						@click="currentReview.approved = !currentReview.approved"
						:prepend-icon="currentReview.approved ? 'mdi-check' : 'mdi-close'"
						:color="currentReview.approved ? 'success' : 'error'">
						{{ currentReview.approved ? "Approved" : "Declined " }}
					</v-btn>
					<v-divider vertical thickness="2" />
					<v-btn
						:prepend-icon="currentReview.muted ? 'mdi-volume-off' : 'mdi-volume-high'"
						:variant="currentReview.muted ? 'elevated' : 'tonal'"
						@click="currentReview.muted = !currentReview.muted"
						:color="currentReview.muted ? 'error' : 'primary'">
						{{ currentReview.muted ? "Muted" : "Not Muted" }}
					</v-btn>
				</v-btn-group>
				<v-spacer />
				<v-btn color="primary" appendIcon="mdi-plus" @click="emits('new')">NEW REVIEW</v-btn>
				<v-btn
					icon
					@click="saveReview"
					color="primary"
					class="ml-2"
					rounded
					density="comfortable"
					:loading="reviewStore.loading">
					<v-icon>mdi-content-save-outline</v-icon>
					<v-tooltip activator="parent" location="bottom"
						>{{ currentReview.id ? "Update" : "Save" }} review</v-tooltip
					>
				</v-btn>
			</v-card-title>
			<v-card-subtitle>
				<v-row dense>
					<v-col>
						<v-text-field
							single-line
							hide-details
							class="mb-2"
							clearable
							prefix="Created at: "
							density="compact"
							variant="solo-filled"
							:label="currentReview.created_at ? '' : 'Date'"
							@update:model-value="
								currentReview.created_at = $event ? new Date($event).toLocaleString() : ''
							"
							:model-value="
								currentReview.created_at ? new Date(currentReview.created_at).toLocaleString() : ''
							" />
					</v-col>
					<v-col cols="auto">
						<v-autocomplete
							density="compact"
							variant="solo-filled"
							:min-width="`${(currentReview.role?.length || 0) * 10 + 110}px`"
							style="transition: all 0.3s"
							single-line
							clearable
							class="mb-2"
							hide-details
							auto-select-first
							hide-selected
							:items="settingsStore.skills"
							v-model="currentReview.role"
							@update:search="userIdSelected"
							label="Role"
							:rules="[(v) => !!v || 'Skill is required']" />
					</v-col>
				</v-row>

				<v-chip class="mt-2" rounded="sm" v-if="currentReview.updated_at">
					Updated at:
					{{ new Date(currentReview.updated_at).toLocaleString() }}</v-chip
				>

				<v-divider thickness="1"></v-divider>
			</v-card-subtitle>

			<v-card-item>
				<v-form validate-on="input lazy" ref="form">
					<!-- Modify created date -->

					<v-row class="align-center">
						<v-col>
							<v-combobox
								label="Title"
								clearable
								auto-select-first
								density="comfortable"
								variant="solo-filled"
								v-model="currentReview.title"
								@update:search="titleSelected"
								:rules="[(v) => !!v || 'Title is required']"
								:items="existingTitles" />
						</v-col>
					</v-row>

					<v-text-field
						label="URL"
						variant="solo-filled"
						density="comfortable"
						append-inner-icon="mdi-link"
						placeholder="https://hiddendevs.com/applications/1"
						clearable
						v-model="currentReview.url"
						:rules="[
							(v) => !!v || 'URL is required',
							(v) => /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(v) || 'Must be a valid URL',
							(v) => v.includes('hiddendevs.com') || 'URL must be from hiddendevs.com domain',
						]" />

					<v-combobox
						label="User ID"
						clearable
						auto-select-first
						density="comfortable"
						variant="solo-filled"
						:rules="[
							(v) => !!v || 'User ID is required',
							(v) => !isNaN(Number(v)) || 'User ID must be a number',
						]"
						v-model="currentReview.user_id"
						@update:search="userIdSelected"
						:items="existingUserIds" />

					<v-row>
						<v-col>
							<v-textarea
								label="Review"
								append-inner-icon="mdi-message-text"
								variant="solo-filled"
								ref="review-area"
								class="mb-2"
								hide-details
								density="comfortable"
								auto-grow
								v-model="currentReview.review">
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
									new Date(previousReview.created_at) > new Date(currentReview.created_at)
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

					<v-row class="align-center mt-0">
						<v-col>
							<v-file-input
								clearable
								multiple
								chips
								class="mb-2"
								hide-details
								accept="image/*"
								variant="solo-filled"
								prepend-icon=""
								append-inner-icon="mdi-image-multiple"
								label="Media"
								v-model="reviewStore.evidence">
							</v-file-input>
						</v-col>
						<v-col cols="auto" v-if="currentReview.evidence.length" title="Disabled">
							<v-btn disabled readonly @click="showImgurUpload = true" color="primary"
								>Upload to IMGUR
							</v-btn>
						</v-col>
					</v-row>
					<ImageSlider class="mt-4" v-model="currentReview.evidence" />
				</v-form>
			</v-card-item>
		</v-card>
		<DraggableTextarea v-if="showDraggable" v-model="currentReview.review" />

		<ImgurDialog v-model="showImgurUpload" />
	</div>
</template>

<script lang="ts" setup>
import { toast } from "vuetify-sonner"

const settingsStore = useSettingsStore()
const reviewStore = useReviewStore()
const reviewArea = useTemplateRef("review-area")
const existingUserIds = computed(() => [...new Set(reviewStore.reviews?.map((review) => review.user_id) || [])])
const existingTitles = computed(() => [...new Set(reviewStore.reviews?.map((review) => review.title) || [])])
const form = useTemplateRef("form")
const showImgurUpload = ref(false)
defineExpose({ form })

const emits = defineEmits<{ new: [] }>()

const currentReview = computed(() => reviewStore.currentReview)
const userIdSelected = () => {
	const review = reviewStore.reviews?.find((review) => review.user_id === currentReview.value.user_id)
	if (review) {
		currentReview.value.title = review.title
	}
}
const titleSelected = () => {
	const review = reviewStore.reviews?.find((review) => review.title === currentReview.value.title)
	if (review) {
		currentReview.value.user_id = review.user_id
	}
}

const saveReview = async () => {
	const validationObject = await form.value?.validate()
	if (!validationObject?.valid) {
		toast.error("Please fix the errors before saving the review.")
		return
	}

	await reviewStore.saveReview()
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
				currentReview.value.evidence.push(base64)
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
		(review) =>
			review.user_id === currentReview.value.user_id &&
			review.id !== currentReview.value.id &&
			review.role === currentReview.value.role
	)
)
const previousReview = computed(
	() =>
		quickSort(
			personalReviews.value || [],
			(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
		)[previousReviewIndex.value]
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
	card.value?.addEventListener("paste", handlePaste)
})

onUnmounted(() => {
	observer.disconnect()
	card.value?.removeEventListener("paste", handlePaste)
})
</script>
