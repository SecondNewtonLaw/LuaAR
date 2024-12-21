<template>
	<v-row>
		<v-col cols="12">
			<v-card flat>
				<v-card-title>
					Reviews

					<v-btn-toggle density="comfortable" mandatory v-model="viewMode" class="ml-4 border">
						<v-btn value="list" icon="mdi-view-list-outline"></v-btn>
						<v-btn value="grid" icon="mdi-view-grid-outline"></v-btn>
					</v-btn-toggle>
				</v-card-title>

				<v-card-text class="pa-0">
					<v-row class="px-4" align-content="center" dense>
						<v-col>
							<v-text-field
								v-model="search"
								label="Search"
								density="compact"
								prepend-inner-icon="mdi-magnify"
								variant="outlined"
								hide-details
								single-line></v-text-field>
						</v-col>

						<!-- Filter for muted apps, apps with evidence, approved and declined apps -->
						<v-col cols="auto">
							<v-select
								variant="outlined"
								density="compact"
								single-line
								hide-details
								min-width="10rem"
								multiple
								chips
								clearable
								v-model="filtersEnabled"
								:items="Object.keys(filters)"
								label="Filters"
								dense>
							</v-select>
						</v-col>

						<v-col cols="auto">
							<v-btn @click="chooseDirectory" color="primary" outlined>
								<v-icon icon="mdi-folder-open" class="mr-2"></v-icon>
								Choose Directory
								<v-tooltip activator="parent" location="bottom">
									{{ reviewStore.chosenPath || "No directory chosen" }}
								</v-tooltip>

								<template v-slot:append v-if="reviewStore.chosenPath">
									<v-btn
										density="compact"
										variant="elevated"
										icon="mdi-close"
										@click.stop="reviewStore.chosenPath = null"></v-btn>
								</template>
							</v-btn>
						</v-col>

						<v-col cols="auto">
							<v-btn
								density="comfortable"
								variant="outlined"
								:loading="reviewStore.loading"
								icon="mdi-refresh"
								@click="reviewStore.loadReviews"
								color="primary"
								outlined />
						</v-col>
					</v-row>

					<v-expand-transition mode="out-in">
						<ReviewList v-if="viewMode === 'list'" :reviews="reviews" />
						<ReviewGrid v-else :reviews="reviews" />
					</v-expand-transition>
				</v-card-text>
			</v-card>
		</v-col>
		<v-col cols="12">
			<ReviewStatistics :reviews="reviews" />
		</v-col>
	</v-row>
</template>

<script lang="ts" setup>
import { open } from "@tauri-apps/plugin-dialog"
import { toast } from "vuetify-sonner"

const reviewStore = useReviewStore()

const viewMode = ref<"list" | "grid">("list")
type Filter = (r: Review) => boolean
const filters: Record<string, Filter> = {
	"Has Evidence": (r) => !!r.evidence && r.evidence.length > 0,
	Approved: (r) => !!r.approved,
	Declined: (r) => !r.approved,
	Muted: (r) => !!r.muted,
}

const search = ref("")
const filtersEnabled = ref<string[]>([])

const reviews = computed(() =>
	reviewStore.reviews
		?.filter((review) => {
			if (filtersEnabled.value.length === 0) return true
			return filtersEnabled.value.every((filter) => filters[filter](review))
		})
		.filter((review) => {
			if (!search.value) return true
			const searchLower = search.value.toLowerCase()
			return (
				review.review?.toLowerCase().includes(searchLower) ||
				review.user_id?.toLowerCase().includes(searchLower) ||
				review.title?.toLowerCase().includes(searchLower) ||
				review.url?.toLowerCase().includes(searchLower)
			)
		})
)

const chooseDirectory = async () => {
	try {
		const directory = await open({
			directory: true,
			recursive: true,
		})

		if (!directory) return
		reviewStore.chosenPath = directory
	} catch (error) {
		console.log(error)
		toast.error("Failed to open directory")
	}
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.15s;
}
.fade-enter,
.fade-leave-to {
	opacity: 0;
}
</style>
