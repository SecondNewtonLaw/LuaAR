<template>
	<v-container>
		<v-btn color="primary" appendIcon="mdi-plus" class="mb-2" @click="newReview">NEW REVIEW</v-btn>
		<CurrentReview class="mb-6" ref="form" />

		<v-row>
			<v-col>
				<v-btn-group>
					<v-btn icon @click="editorStore.addEditor()">
						<v-icon>mdi-plus</v-icon>
						<v-tooltip activator="parent" location="bottom">Add Editor</v-tooltip>
					</v-btn>
					<v-btn
						icon
						width="56px"
						v-if="reviewed"
						:disabled="!hasPreviousReview"
						@click="promptReviewChoice()">
						<v-icon>mdi-plus</v-icon>
						<v-icon>mdi-comment-text-outline</v-icon>
						<v-tooltip activator="parent" location="bottom">Add Editor from other Review(s)</v-tooltip>
					</v-btn>
					<v-btn icon @click="editorStore.resetEditors()">
						<v-icon>mdi-refresh</v-icon>
						<v-tooltip activator="parent" location="bottom" text="Reset Editors" />
					</v-btn>
					<v-btn icon @click="showDiff">
						<v-icon>mdi-file-compare</v-icon>
						<v-tooltip activator="parent" location="bottom">Show Diff</v-tooltip>
					</v-btn>
					<v-btn icon @click="saveReview">
						<v-icon>mdi-content-save-outline</v-icon>
						<v-tooltip activator="parent" location="bottom">Save Review</v-tooltip>
					</v-btn>
				</v-btn-group>
			</v-col>
		</v-row>
		<v-row>
			<v-col :cols="editors.length > 1 ? 6 : 12" v-for="(editor, index) in editors" :key="index">
				<EditorCard :editor />
			</v-col>

			<v-col v-if="diffVisible" cols="12">
				<DiffViewer
					:originalContent="originalContent"
					:modifiedContent="modifiedContent"
					v-model="diffVisible" />
			</v-col>
		</v-row>

		<VDialog :model-value="reviewsInDialog.length > 0" width="auto" @after-leave="reviewsInDialog = []">
			<v-card
				max-width="400"
				prepend-icon="mdi-information"
				text="Select a review to add as an editor"
				title="Select Review">
				<v-card-text>
					<v-list>
						<v-list-item
							v-for="review in reviewsInDialog"
							:key="review.id"
							@click="addEditorFromReview(review.id || '')">
							<v-list-item-title>{{ review.title }}</v-list-item-title>
							<v-list-item-subtitle
								>{{ new Date(review.created_at).toLocaleString() }}
							</v-list-item-subtitle>
							<v-chip color="primary" small>{{ formatTimeAgo(review.created_at) }} ago</v-chip>
						</v-list-item>
					</v-list>
				</v-card-text>
			</v-card>
		</VDialog>

		<!-- Confirmation dialog -->
		<VDialog v-model="newReviewConfirmationDialogVisible" width="400">
			<v-card>
				<v-card-title class="headline">Confirm New Review</v-card-title>
				<v-card-text> You have unsaved changes. Are you sure you want to start a new review? </v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="primary" @click="confirmNewReview">Yes</v-btn>
					<v-btn color="primary" @click="newReviewConfirmationDialogVisible = false">No</v-btn>
				</v-card-actions>
			</v-card>
		</VDialog>
	</v-container>
</template>

<script lang="ts" setup>
import { toast } from "vuetify-sonner"

const editorStore = useEditorStore()
const reviewStore = useReviewStore()
const editors = computed(() => editorStore.editors)
const diffVisible = ref(false)
const originalContent = ref("")
const modifiedContent = ref("")
const form = ref<{ form: HTMLFormElement | null }>({ form: null })
const newReviewConfirmationDialogVisible = ref(false)

const showDiff = () => {
	if (editors.value.length == 2) {
		editors.value.forEach((editor) => (editor.selected = true))
	}
	const selectedEditors = editors.value.filter((editor) => editor.selected)
	if (selectedEditors.length === 2) {
		originalContent.value = selectedEditors[0].input
		modifiedContent.value = selectedEditors[1].input
		diffVisible.value = true
	} else {
		alert("Please select exactly 2 editors to compare.")
	}
}

const reviewed = computed(() => reviewStore.currentReview.id)
const reviewsInDialog = ref<Review[]>([])
const hasPreviousReview = computed(
	() =>
		(reviewStore.reviews || []).filter((review) => review.user_id === reviewStore.currentReview.user_id).length > 1
)

const promptReviewChoice = () => {
	const reviews = reviewStore.reviews
		?.filter(
			(review) =>
				review.user_id === reviewStore.currentReview.user_id && review.id !== reviewStore.currentReview.id
		)
		.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
	if (!reviews) return
	if (reviews.length > 1) {
		reviewsInDialog.value = reviews
	} else {
		addEditorFromReview(reviews[0]?.id || "")
	}
}
const addEditorFromReview = async (id: string) => {
	reviewsInDialog.value = []
	const review = reviewStore.reviews?.find((review) => review.id === id)
	if (review && review.id) {
		const editor = (await reviewStore.getEditorsFromReview(review.id))[0]
		editor.title = `From Review: #${review.id} | ${editor.title ?? "Editor 1"}`
		editorStore.addEditor(editor)
	}
}
const newReview = () => {
	if (reviewStore.isTouched || isAnyEditorFilled.value) {
		newReviewConfirmationDialogVisible.value = true
	} else {
		proceedWithNewReview()
	}
}

const confirmNewReview = () => {
	newReviewConfirmationDialogVisible.value = false

	proceedWithNewReview()
}

const proceedWithNewReview = () => {
	toast.success("New Review Created")
	form.value?.form?.reset()
	reviewStore.newReview()
}

const saveReview = async () => {
	await reviewStore.saveReview()
}

const isAnyEditorFilled = computed(() => editors.value.some(({ input }) => input !== ""))

const formatTimeAgo = (date: string) => {
	const now = new Date().getTime()
	const createdAt = new Date(date).getTime()
	const days = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24))
	const hours = Math.floor(((now - createdAt) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
	return `${days} days ${hours} hours`
}
</script>

<style scoped lang="scss">
.v-btn-group {
	display: flex;
	justify-content: center;
}

.v-btn {
	margin: 0 5px;
	border-radius: 0;
}
</style>
