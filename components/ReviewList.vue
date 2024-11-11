<template>
	<v-card title="Reviews" flat>
		<template v-slot:text>
			<v-text-field
				v-model="search"
				label="Search"
				prepend-inner-icon="mdi-magnify"
				variant="outlined"
				hide-details
				single-line></v-text-field>
		</template>
		<v-data-table
			:headers="headers"
			:items="userReviewCounts"
			:search="search"
			item-key="id"
			class="elevation-1"
			:sort-by="sortBy"
			@click:row="selectReview">
			<template #item.url="{ item }">
				<v-chip color="primary" v-if="item.url" small :href="item.url" @click.stop>{{ item.url }}</v-chip>
				<v-chip color="grey" v-else small>None</v-chip>
			</template>
			<template #item.evidence="{ item }">
				<v-checkbox @click.stop readonly :model-value="!!item.evidence && item.evidence.length > 0">
					<v-tooltip activator="parent" location="bottom">
						{{ item.evidence ? `Evidence provided (${item.evidence.length})` : `No evidence provided` }}
					</v-tooltip>
				</v-checkbox>
			</template>

			<template #item.actions="{ item }">
				<v-icon small @click.stop="removeReview(item)">mdi-trash-can</v-icon>
			</template>
		</v-data-table>
	</v-card>
</template>

<script lang="ts" setup>
const reviewStore = useReviewStore()
const props = defineProps<{
	reviews?: Review[]
}>()

const userReviewCounts = computed(() => {
	const counts: Record<string, number> = {}
	return (
		props.reviews
			?.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
			.map((review) => {
				if (!counts[review.user_id]) {
					counts[review.user_id] = 0
				}
				counts[review.user_id]++
				return { ...review, userReviewIndex: counts[review.user_id] }
			}) || []
	)
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
	{
		title: "Actions",
		key: "actions",
	},
])

const selectReview = (_event: PointerEvent, row: any) => {
	const review = row.item as Review
	reviewStore.loadReview(review.id)
	useRouter().push({ name: "index" })
}
const search = ref("")

const removeReview = (review: Review) => {
	if (!review.id) return
	reviewStore.removeReview(review.id)
}
</script>

<style scoped></style>
