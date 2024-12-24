<template>
	<div>
		<v-row>
			<v-col cols="12">
				<v-data-table
					:headers="headers"
					:items="users"
					:items-per-page="10"
					v-model="selected"
					:loading="reviewStore.loading"
					:sort-by="sortBy">
					<template #item.approved="{ value }">
						<v-chip dense :text="value ? 'Approved' : 'Not Approved'" :color="value ? 'green' : 'red'" />
					</template>
					<template #item.created_at="{ value }">
						{{ new Date(value).toLocaleString() }}
					</template>
					<template #item.actions="{ item }">
						<v-btn-group density="compact">
							<v-btn
								icon="mdi-shield-account"
								density="comfortable"
								color="primary"
								@click.stop="shell.open(`https://hiddendevs.com/admin/useredit?userid=${item.id}`)"
								title="View User" />

							<v-divider thickness="2" class="mx-1" vertical></v-divider>

							<v-btn
								icon="mdi-delete"
								density="comfortable"
								color="red"
								@click.stop=";(isDialogOpen = true) && (selected = [item.id?.toString() || ''])"
								title="Delete Review" />
						</v-btn-group>
					</template>
				</v-data-table>
			</v-col>
		</v-row>

		<ConfirmDialog
			v-model="isDialogOpen"
			@confirm="confirmRemoveUser"
			title="Remove User"
			color="error"
			text="Are you sure you want to remove the selected user?"
			submit="Remove" />
	</div>
</template>

<script lang="ts" setup>
import * as shell from "@tauri-apps/plugin-shell"

import { toast } from "vuetify-sonner"

interface User {
	id: string
	title: string
	mutes: number
	reviews: number
	approved?: boolean
	created_at: string
}

const reviewStore = useReviewStore()
const reviews = computed(() =>
	quickSort(reviewStore.reviews || [], (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
)

const selected = ref<string[]>([])
const isDialogOpen = ref(false)
//each review has a user_id, title, and muted property, calculate mutes and reviews for each user
const users = computed(() => {
	const users: Record<string, User> = {}
	reviews.value.forEach((review) => {
		if (!users[review.user_id]) {
			users[review.user_id] = {
				id: review.user_id,
				title: review.title || "",
				mutes: 0,
				reviews: 0,
				created_at: review.created_at,
			}
		}
		users[review.user_id].reviews++
		if (review.muted) {
			users[review.user_id].mutes++
		}

		if (review.approved) {
			users[review.user_id].approved = true
		}

		//if created at is earlier than currently set, then set that
		if (users[review.user_id].created_at) {
			users[review.user_id].created_at = review.created_at
		}
	})
	return Object.values(users)
})

const confirmRemoveUser = async () => {
	if (selected.value.length === 0) return
	toast.info("Removing user...")
}

const sortBy = ref([{ key: "created_at", order: "asc" as const }])
const headers = [
	{ title: "User ID", key: "id" },
	{ title: "Title", key: "title" },
	{
		title: "Approved",
		key: "approved",
		value: (value: User) => !!value.approved,
		align: "center" as const,
		sortable: false,
	},
	{ title: "Mutes", key: "mutes" },
	{ title: "Reviews", key: "reviews" },
	{
		title: "Created At",
		key: "created_at",
		sort: (a: string, b: string) => new Date(b).getTime() - new Date(a).getTime(),
	},
	{ title: "Actions", key: "actions", sortable: false, align: "center" as const },
]
</script>

<style></style>
