<template>
	<v-card title="Reviews" flat>
		<template v-slot:text>
			<v-text-field
				v-model="search"
				label="Search"
				prepend-inner-icon="mdi-magnify"
				variant="outlined"
				hide-details
				single-line
			></v-text-field>
		</template>
		<v-data-table
			:headers="headers"
			:items="reviews"
			:search="search"
			item-key="id"
			class="elevation-1"
			:sort-by="sortBy"
			@click:row="selectReview"
		/>
	</v-card>
</template>

<script lang="ts" setup>
import { ref } from "vue"
export interface Review {
	title: string
	created_at: string
	updated_at: string
	url: string
	user_id: string
	review: string
	id?: string
}
const props = defineProps<{
	reviews?: Review[]
}>()

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
	{ title: "Title", key: "title" },
	{ title: "URL", key: "url" },

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
])

const selectReview = (_event: PointerEvent, row: any) => {
	const review = row.item as Review
	useReviewStore().loadReview(review.id)
	useRouter().push({ name: "index" })
}
const search = ref("")
</script>

<style scoped>
.review-card {
	cursor: pointer;
}
</style>
