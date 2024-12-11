<template>
	<v-card title="Reviews" flat>
		<template v-slot:text>
			<v-row align="center" align-content="center" dense>
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
								variant="flat"
								icon="mdi-close"
								@click.stop="reviewStore.chosenPath = null"></v-btn>
						</template>
					</v-btn>
				</v-col>

				<v-col cols="auto">
					<v-btn
						rounded="lg"
						variant="text"
						icon="mdi-refresh"
						@click="reviewStore.loadReviews"
						color="primary"
						outlined />
				</v-col>
				<v-col cols="auto" v-if="selected.length > 0">
					<v-btn variant="text" icon="mdi-delete" @click="isDialogOpen = true" color="red" outlined />
				</v-col>
			</v-row>
		</template>

		<v-data-table
			v-model="selected"
			:headers="headers"
			:items="userReviewCounts"
			:search="search"
			title=""
			select-strategy="page"
			density="compact"
			show-select
			item-key="id"
			:items-per-page-options="[5, 10, 15, 20]"
			class="elevation-1"
			:sort-by="sortBy"
			:custom-filter="customFilter"
			@click:row="selectReview">
			<template #item.url="{ item }">
				<v-chip color="primary" v-if="item.url" small :href="item.url" @click.stop>{{ item.url }}</v-chip>
				<v-chip color="grey" v-else small>None</v-chip>
			</template>
			<template #item.evidence="{ item }">
				<v-checkbox
					@click.stop
					readonly
					:model-value="!!item.evidence && item.evidence.length > 0"
					hide-details>
					<v-tooltip activator="parent" location="bottom">
						{{ item.evidence ? `Evidence provided (${item.evidence.length})` : `No evidence provided` }}
					</v-tooltip>
				</v-checkbox>
			</template>
		</v-data-table>

		<v-dialog v-model="isDialogOpen" max-width="500">
			<v-card>
				<v-card-title class="headline">Confirm Deletion</v-card-title>
				<v-card-text>
					Are you sure you want to remove the selected review{{ selected.length > 1 ? "s" : "" }}?
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn @click="isDialogOpen = false">Cancel</v-btn>
					<v-btn color="red" @click="confirmRemoveReview">Delete</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</v-card>
</template>

<script lang="ts" setup>
import { open } from "@tauri-apps/plugin-dialog"
const reviewStore = useReviewStore()
const props = defineProps<{
	reviews?: Review[]
}>()

const selected = ref<string[]>([])

const userReviewCounts = computed(() => {
	if (!props.reviews) return []

	const counts = new Map<string, number>()
	return props.reviews
		.slice() // Create a shallow copy to avoid mutating props
		.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
		.map((review) => {
			const id = review.user_id
			if (!id) return { ...review, userReviewIndex: 0 }
			const count = counts.get(id) || 0
			counts.set(id, count + 1)
			return {
				...review,
				userReviewIndex: count + 1,
			}
		})
})

const dateFormatter = new Intl.DateTimeFormat("en-US", {
	year: "numeric",
	month: "short",
	day: "numeric",
	hour: "numeric",
	minute: "numeric",
	second: "numeric",
})

const sortBy = ref([{ key: "created_at", order: "desc" as const }])
const headers = ref([
	{ title: "User ID", key: "user_id" },
	{ title: "Review Index", key: "userReviewIndex", value: (item: Record<string, any>) => `#${item.userReviewIndex}` },

	{ title: "Title", key: "title" },
	{ title: "URL", key: "url" },

	{ title: "Evidence", key: "evidence" },

	{
		title: "Created At",
		key: "created_at",
		sort: (a: string, b: string) => new Date(a).getTime() - new Date(b).getTime(),
		value: (item: Record<string, any>) => dateFormatter.format(new Date(item.created_at)),
	},
	{
		title: "Updated At",
		key: "updated_at",
		sort: (a: string, b: string) => new Date(a).getTime() - new Date(b).getTime(),
		value: (item: Record<string, any>) => dateFormatter.format(new Date(item.updated_at)),
	},
	// {
	// 	title: "Actions",
	// 	key: "actions",
	// },
])

const chooseDirectory = async () => {
	const directory = await open({
		directory: true,
		recursive: true,
	})

	if (!directory) return
	reviewStore.chosenPath = directory
}

const selectReview = (_event: PointerEvent, row: any) => {
	const review = row.item as Review
	reviewStore.loadReview(review.id)
	useRouter().push({ name: "index" })
}
const search = ref("")
const dates = ref(["", ""])

const isDialogOpen = ref(false)
const confirmRemoveReview = () => {
	selected.value.forEach((id) => {
		reviewStore.removeReview(id)
	})

	selected.value = []
	isDialogOpen.value = false
}

interface InternalItem<T = any> {
	value: any
	raw: T
}
const customFilter = (
	_value: string,
	_query: string,
	item?: InternalItem<Review>
): boolean | number | [number, number] | [number, number][] => {
	if (!search.value && !dates.value) return true
	if (!item) return false

	const review = item.raw as Review
	const searchLower = search.value.toLowerCase()

	const matchesSearch =
		review.user_id?.toLowerCase().includes(searchLower) ||
		review.review?.toLowerCase().includes(searchLower) ||
		review.title?.toLowerCase().includes(searchLower) ||
		(!!review.url && review.url.toLowerCase().includes(searchLower))

	return matchesSearch
}
</script>

<style scoped></style>
