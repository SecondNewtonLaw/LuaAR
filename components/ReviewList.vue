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
		</template>

		<v-data-table
			v-model="selected"
			:headers="headers"
			:loading="reviewStore.loading"
			:items="userReviewCounts"
			:search="search"
			title=""
			hover
			select-strategy="page"
			density="compact"
			item-key="id"
			:row-props="rowProps"
			:items-per-page-options="[5, 10, 20, 50, 100]"
			class="elevation-1"
			:sort-by="sortBy"
			:custom-filter="customFilter"
			@click:row="selectReview">
			<template v-slot:loading>
				<v-skeleton-loader loading type="table-row@10"></v-skeleton-loader>
			</template>
			<template #item.url="{ value }">
				<v-chip color="primary" v-if="value" small :href="value" @click.stop.prevent="openLink(value)">{{
					value
				}}</v-chip>
				<v-chip color="grey" v-else small>None</v-chip>
			</template>
			<template #item.evidence="{ value }">
				<v-checkbox
					@click.stop
					readonly
					:model-value="!!value && value.length > 0"
					hide-details
					class="d-inline-flex"
					dense>
					<v-tooltip activator="parent" location="bottom">
						{{ value ? `Evidence provided (${value.length})` : `No evidence provided` }}
					</v-tooltip>
				</v-checkbox>
			</template>

			<template #item.muted="{ value }">
				<v-icon :color="value ? 'red' : 'grey'" :icon="value ? 'mdi-volume-off' : 'mdi-volume-high'" />
			</template>

			<template #item.actions="{ item }">
				<v-btn-group density="compact">
					<v-btn
						icon="mdi-shield-account"
						density="comfortable"
						color="primary"
						@click.stop="openLink(`https://hiddendevs.com/admin/useredit?userid=${item.user_id}`)"
						title="View User" />

					<v-btn
						:icon="item.approved ? 'mdi-check' : 'mdi-close'"
						density="comfortable"
						:title="item.approved ? 'Approved' : 'Declined'"
						:loading="reviewStore.loadingApproval"
						@click.stop="reviewStore.toggleApproval(item)"
						:color="item.approved ? 'success' : 'error'">
					</v-btn>
					<v-divider thickness="2" class="mx-1" vertical></v-divider>
					<v-btn
						icon="mdi-pencil"
						density="comfortable"
						color="primary"
						@click.stop="reviewStore.loadReview(item.id)"
						title="Edit Review" />

					<v-btn
						icon="mdi-delete"
						density="comfortable"
						color="red"
						@click.stop=";(isDialogOpen = true) && (selected = [item.id?.toString() || ''])"
						title="Delete Review" />
				</v-btn-group>
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
import * as shell from "@tauri-apps/plugin-shell"
import { toast } from "vuetify-sonner"
const reviewStore = useReviewStore()
const props = defineProps<{
	reviews?: Review[]
}>()

const selected = ref<string[]>([])

const dateFormatter = new Intl.DateTimeFormat("en-US", {
	year: "numeric",
	month: "short",
	day: "numeric",
	hour: "numeric",
	minute: "numeric",
})

type Filter = (r: Review) => boolean
const filters: Record<string, Filter> = {
	"Has Evidence": (r) => !!r.evidence && r.evidence.length > 0,
	Approved: (r) => !!r.approved,
	Declined: (r) => !r.approved,
	Muted: (r) => !!r.muted,
}
const filtersEnabled = ref<string[]>([])
const userReviewCounts = computed(() => {
	if (!props.reviews) return []

	const counts = new Map<string, number>()
	const reviews = filtersEnabled.value.length
		? props.reviews.filter((review) => filtersEnabled.value.every((filter) => filters[filter](review)))
		: props.reviews
	return reviews
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

const sortBy = ref([{ key: "created_at", order: "desc" as const }])
const headers = ref([
	{ title: "User ID", key: "user_id" },
	{
		title: "Review Index",
		key: "userReviewIndex",
		value: (item: Review & { userReviewIndex: number }) => `#${item.userReviewIndex}`,
	},

	{ title: "Title", key: "title" },
	{
		title: "URL",
		key: "url",
		value: (item: Review) => {
			if (!item.url) return
			try {
				const url = new URL(item.url)
				url.searchParams.delete("offset")

				//remove www
				if (url.hostname.startsWith("www.")) {
					url.hostname = url.hostname.slice(4)
				}

				return url.toString()
			} catch {
				return item.url
			}
		},
	},

	{ title: "Evidence", key: "evidence", sortable: false, align: "center" as const },
	{
		title: "Muted",
		key: "muted",
		sortable: false,
		align: "center" as const,
	},
	{
		title: "Created At",
		key: "created_at",
		sort: (a: string, b: string) => new Date(a).getTime() - new Date(b).getTime(),
		value: (item: Review) => dateFormatter.format(new Date(item.created_at)),
	},
	{
		title: "Updated At",
		key: "updated_at",
		sort: (a: string, b: string) => new Date(a).getTime() - new Date(b).getTime(),
		value: (item: Review) => dateFormatter.format(new Date(item.updated_at)),
	},

	{
		title: "Actions",
		key: "actions",
		align: "center" as const,
		sortable: false,
	},
])

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
let clickTimeout: number | null = null

const selectReview = (event: PointerEvent, row: any) => {
	const review = row.item as Review

	if (clickTimeout) {
		clearTimeout(clickTimeout)
		clickTimeout = null
	}

	if (event.detail === 1) {
		clickTimeout = window.setTimeout(() => {
			const target = event.target as HTMLElement
			const text = target.textContent || ""
			navigator.clipboard.writeText(text)
			toast.success("Copied to clipboard")
		}, 300) // Adjust the timeout duration as needed
	} else if (event.detail === 2) {
		// Double click: select review
		reviewStore.loadReview(review.id)
		useRouter().push({ name: "index" })
	}
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
	if (!item) return false
	const review = item.raw as Review

	if (!search.value && !dates.value) return true

	const searchLower = search.value.toLowerCase()

	const matchesSearch =
		review.user_id?.toLowerCase().includes(searchLower) ||
		review.review?.toLowerCase().includes(searchLower) ||
		review.title?.toLowerCase().includes(searchLower) ||
		(!!review.url && review.url.toLowerCase().includes(searchLower))

	if (!matchesSearch) return false

	return true
}

const openLink = (link: string) => {
	shell.open(link)
}

const rowProps = (item: any) => ({
	"review-approved": !!(item.item as Review).approved,
})
</script>

<style scoped lang="scss">
:deep(.v-data-table__tr) {
	&[review-approved="true"] {
		background-color: #00ff1515 !important;
	}
	background-color: #ff000015 !important;
}
</style>
