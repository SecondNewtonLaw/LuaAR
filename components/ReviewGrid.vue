<template>
	<v-card flat>
		<!-- Make a grid inside v card text 3x3 pages with title of the review -->
		<v-card-text>
			<v-data-iterator :items="reviews || []" items-per-page="12" :loading="reviewStore.loading">
				<template #default="{ items }">
					<v-row v-if="items.length > 0">
						<v-col sm="6" md="4" lg="3" v-for="review in items" :key="review.raw.id">
							<v-card class="px-6 pt-6" @click="selectReview(review.raw)" hover>
								<v-card-title>{{ review.raw.title }}</v-card-title>
								<v-card-subtitle>{{ review.raw.role || settingsStore.defaultRole }}</v-card-subtitle>
								<v-card-actions>
									<v-spacer />
									<v-chip variant="text" color="grey">
										{{ new Date(review.raw.created_at).toLocaleString() }}
									</v-chip>
								</v-card-actions>

								<!-- Approved icon top right -->
								<v-icon
									class="top-0 right-0 position-absolute mr-2 mt-2"
									:icon="review.raw.approved ? 'mdi-check-circle' : 'mdi-close-circle'"
									:color="review.raw.approved ? 'success' : 'error'"
									size="24"></v-icon>
							</v-card>
						</v-col>
					</v-row>
				</template>
				<template #no-data>
					<v-row>
						<v-col>
							<v-card>
								<v-card-title>No reviews found</v-card-title>
							</v-card>
						</v-col>
					</v-row>
				</template>

				<template #footer="{ page, pageCount, nextPage, prevPage }">
					<div class="d-flex align-center justify-center pa-4">
						<v-btn
							:disabled="page === 1"
							density="comfortable"
							icon="mdi-arrow-left"
							variant="tonal"
							rounded
							@click="prevPage"></v-btn>

						<div class="mx-2 text-caption">Page {{ page }} of {{ pageCount }}</div>

						<v-btn
							:disabled="page >= pageCount"
							density="comfortable"
							icon="mdi-arrow-right"
							variant="tonal"
							rounded
							@click="nextPage"></v-btn>
					</div>
				</template>

				<template v-slot:loader>
					<v-row>
						<v-col v-for="(_, k) in [0, 1, 2, 3, 4, 5, 6, 7, 8]" :key="k" cols="4">
							<v-skeleton-loader type="article"></v-skeleton-loader>
						</v-col>
					</v-row>
				</template>
			</v-data-iterator>
		</v-card-text>
	</v-card>
</template>

<script lang="ts" setup>
const router = useRouter()
const settingsStore = useSettingsStore()
const reviewStore = useReviewStore()

const props = defineProps<{ reviews?: Review[] }>()

const reviews = computed(() =>
	props.reviews?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
)
const selectReview = (review: Review) => {
	reviewStore.loadReview(review.id)
	router.push({ name: "index" })
}
</script>

<style scoped lang="scss">
:deep(.v-data-table__tr) {
	&[review-approved="true"] {
		background-color: #00ff1515 !important;
	}
	background-color: #ff000015 !important;
}
</style>
