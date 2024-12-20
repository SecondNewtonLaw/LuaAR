<template>
	<div ref="card">
		<v-card>
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
				<v-text-field
					single-line
					hide-details
					class="mb-2"
					clearable
					prefix="Created at: "
					density="compact"
					variant="solo-filled"
					:label="reviewStore.currentReview.created_at ? '' : 'Date'"
					@update:model-value="
						reviewStore.currentReview.created_at = $event ? new Date($event).toLocaleString() : ''
					"
					:model-value="
						reviewStore.currentReview.created_at
							? new Date(reviewStore.currentReview.created_at).toLocaleString()
							: ''
					" />

				<v-chip class="mt-2" v-if="reviewStore.currentReview.updated_at">{{
					new Date(reviewStore.currentReview.updated_at).toLocaleString()
				}}</v-chip>

				<v-divider class="mt-2" thickness="2"></v-divider>
			</v-card-subtitle>
			<v-card-item>
				<v-form validate-on="input lazy" ref="form">
					<!-- Modify created date -->

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

					<v-row class="align-center mt-0">
						<v-col>
							<v-file-input
								clearable
								multiple
								chips
								hide-details
								accept="image/*"
								variant="solo-filled"
								prepend-icon=""
								append-inner-icon="mdi-image-multiple"
								label="Media"
								v-model="reviewStore.evidence">
								<!-- <template #append v-if="reviewStore.evidence.length">
									<v-btn @click="showImgurUpload = true" color="error"> Imgur </v-btn>
								</template> -->
							</v-file-input>
						</v-col>
						<v-col cols="auto">
							<!-- Muted or not -->
							<v-btn
								:prepend-icon="reviewStore.currentReview.muted ? 'mdi-volume-off' : 'mdi-volume-high'"
								:variant="reviewStore.currentReview.muted ? 'elevated' : 'tonal'"
								@click="reviewStore.currentReview.muted = !reviewStore.currentReview.muted"
								:color="reviewStore.currentReview.muted ? 'error' : 'primary'">
								{{ reviewStore.currentReview.muted ? "Muted" : "Not Muted" }}
							</v-btn>
						</v-col>
					</v-row>
					<ImageSlider class="mt-4" v-model="reviewStore.currentReview.evidence" />
				</v-form>
			</v-card-item>
		</v-card>
		<DraggableTextarea v-if="showDraggable" v-model="reviewStore.currentReview.review" />

		<v-dialog v-model="showImgurUpload" persistent max-width="500px">
			<v-card>
				<v-card-title>Upload to Imgur</v-card-title>
				<v-card-text> Upload the images to Imgur to get the links to embed in the review. </v-card-text>
				<v-card-actions>
					<v-btn color="error" @click="showImgurUpload = false">Cancel</v-btn>
					<v-btn color="primary" @click="upload">Upload</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script lang="ts" setup>
import { toast } from "vuetify-sonner"
const config = useRuntimeConfig()
const { scrape } = useScrape()
const reviewStore = useReviewStore()
const reviewArea = useTemplateRef("review-area")
const existingUserIds = computed(() => [...new Set(reviewStore.reviews?.map((review) => review.user_id) || [])])
const existingTitles = computed(() => [...new Set(reviewStore.reviews?.map((review) => review.title) || [])])
const form = useTemplateRef("form")
const showImgurUpload = ref(false)
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
	card.value?.addEventListener("paste", handlePaste)
})

onUnmounted(() => {
	observer.disconnect()
	card.value?.removeEventListener("paste", handlePaste)
})

const upload = async () => {
	try {
		const links = await Promise.all(
			reviewStore.evidence.map(async (evidence) => {
				const response = await fetch("https://api.imgur.com/3/image", {
					method: "POST",
					headers: {
						Authorization: `Client-ID ${config.public.imgurClientId}`,
					},
					body: JSON.stringify({ image: evidence }),
				})
				const json = await response.json()
				return json.data.link
			})
		)
		reviewStore.currentReview.review += `\n\n${links.join("\n")}`

		toast.success("Images uploaded to Imgur")
	} catch (error) {
		console.log("Failed to upload images to Imgur", error)
		toast.error("Failed to upload images to Imgur")
	} finally {
		showImgurUpload.value = false
	}
}
</script>
