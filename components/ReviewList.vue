<template>
	<v-card flat>
		<v-card-text>
			<v-data-table
				v-model="selected"
				:headers="headers"
				:loading="reviewStore.loading"
				:items="userReviewCounts"
				title=""
				hover
				select-strategy="page"
				density="compact"
				item-key="id"
				:row-props="rowProps"
				:items-per-page-options="[5, 10, 20, 50, 100]"
				class="elevation-1"
				:sort-by="sortBy"
				@click:row="selectReview">
				<template v-slot:loading>
					<v-skeleton-loader loading type="table-row@10"></v-skeleton-loader>
				</template>
				<template #item.url="{ value }">
					<v-chip color="primary" v-if="value" small :href="value" @click.stop.prevent="shell.open(value)">{{
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
							@click.stop="shell.open(`https://hiddendevs.com/admin/useredit?userid=${item.user_id}`)"
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
		</v-card-text>

		<ConfirmDialog
			v-model="isDialogOpen"
			@confirm="confirmRemoveReview"
			title="Remove Review"
			text="Are you sure you want to remove the selected review?"
			submit="Remove" />
	</v-card>
</template>

<script lang="ts" setup>
import * as shell from "@tauri-apps/plugin-shell"

import { toast } from "vuetify-sonner"
const reviewStore = useReviewStore()
const props = defineProps<{
	reviews?: Review[]
}>()

const selected = ref<string[]>([])

const userReviewCounts = computed(() => {
	if (!props.reviews) return []

	const counts = new Map<string, number>()
	const reviews = props.reviews
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
		value: (item: Review) => new Date(item.created_at).toLocaleString(),
	},
	{
		title: "Updated At",
		key: "updated_at",
		sort: (a: string, b: string) => new Date(a).getTime() - new Date(b).getTime(),
		value: (item: Review) => new Date(item.updated_at).toLocaleString(),
	},

	{
		title: "Actions",
		key: "actions",
		align: "center" as const,
		sortable: false,
	},
])

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

const isDialogOpen = ref(false)
const confirmRemoveReview = () => {
	selected.value.forEach((id) => {
		reviewStore.removeReview(id)
	})

	selected.value = []
	isDialogOpen.value = false
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
