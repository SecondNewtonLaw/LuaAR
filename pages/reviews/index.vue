<template>
	<v-row>
		<v-col cols="12">
			<v-row align-content="center" dense>
				<v-col class="py-0">
					<v-text-field
						v-model="search"
						label="Search"
						density="compact"
						single-line
						prepend-inner-icon="mdi-magnify"
						variant="solo-filled"
						hide-details></v-text-field>
				</v-col>

				<!-- Filter for muted apps, apps with evidence, approved and declined apps -->
				<v-col cols="auto" class="py-0">
					<v-select
						variant="solo-filled"
						prepend-inner-icon="mdi-filter"
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

				<v-col cols="auto" class="py-0">
					<v-btn @click="chooseDirectory" height="100%" color="primary" outlined>
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

				<v-col cols="auto" class="py-0 align-center d-flex">
					<v-btn
						:loading="reviewStore.loading"
						variant="tonal"
						rounded
						height="100%"
						icon="mdi-refresh"
						@click="reviewStore.loadReviews"
						color="primary"
						outlined />
				</v-col>
			</v-row>
			<v-row class="align-start px-3 ga-2">
				<v-col class="pa-0">
					<DatePickerComponent
						density="compact"
						single-line
						v-model="settingsStore.startDate"
						label="Start Date" />
				</v-col>
				<v-col class="pa-0">
					<DatePickerComponent
						density="compact"
						single-line
						v-model="settingsStore.endDate"
						label="End Date" />
				</v-col>
				<v-col class="pa-0">
					<v-select
						density="compact"
						single-line
						multiple
						hide-details
						variant="solo-filled"
						prepend-inner-icon="mdi-account-group"
						chips
						closable-chips
						clearable
						v-model="selectedSkills"
						:items="settingsStore.skills"
						label="Roles"></v-select>
				</v-col>
			</v-row>
		</v-col>
		<v-col cols="12">
			<VExpansionPanels :model-value="[0, 1]" multiple>
				<VExpansionPanel eager>
					<VExpansionPanelTitle class="py-0 ma-0 text-h6"
						>Reviews

						<v-btn-toggle density="comfortable" mandatory v-model="viewMode" class="ml-4 border">
							<v-btn @click.stop value="list" icon="mdi-view-list-outline"></v-btn>
							<v-btn @click.stop value="grid" icon="mdi-view-grid-outline"></v-btn> </v-btn-toggle
					></VExpansionPanelTitle>
					<VExpansionPanelText class="pa-0 ma-0">
						<v-expand-transition mode="out-in">
							<ReviewList v-if="viewMode === 'list'" :reviews="reviews" />
							<ReviewGrid v-else :reviews="reviews" />
						</v-expand-transition>
					</VExpansionPanelText>
				</VExpansionPanel>
				<VExpansionPanel eager>
					<VExpansionPanelTitle class="py-0 ma-0 text-h6">Statistics</VExpansionPanelTitle>
					<VExpansionPanelText class="pa-0 ma-0">
						<ReviewStatistics :reviews="reviews" />
					</VExpansionPanelText>
				</VExpansionPanel>
			</VExpansionPanels>
		</v-col>
	</v-row>
</template>

<script lang="ts" setup>
import { open } from "@tauri-apps/plugin-dialog"
import { toast } from "vuetify-sonner"

const settingsStore = useSettingsStore()
const reviewStore = useReviewStore()

const viewMode = ref<"list" | "grid">("list")
const selectedSkills = ref<Skill[]>([])

type Filter = (r: Review) => boolean
const filters: Record<string, Filter> = {
	"Has Media": (r) => !!r.evidence && r.evidence.length > 0,
	Approved: (r) => !!r.approved,
	Declined: (r) => !r.approved,
	Muted: (r) => !!r.muted,
}

const search = ref("")
const filtersEnabled = ref<string[]>([])

const reviews = computed(() =>
	reviewStore.reviews?.filter((review) => {
		if (selectedSkills.value.length && !selectedSkills.value.includes(review.role)) return false
		if (settingsStore.startDate && new Date(review.created_at) < settingsStore.startDate) return false
		if (settingsStore.endDate && new Date(review.created_at) > settingsStore.endDate) return false
		if (filtersEnabled.value.length > 0) return filtersEnabled.value.every((filter) => filters[filter](review))
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
