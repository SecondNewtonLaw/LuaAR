<template>
	<div>
		<CurrentReview class="mb-6" ref="form" @new="newReview" />

		<v-row>
			<v-col>
				<v-btn-group>
					<v-btn icon @click="editorStore.addEditor()">
						<v-icon>mdi-plus</v-icon>
						<v-tooltip activator="parent" location="bottom">Add Editor</v-tooltip>
					</v-btn>
					<v-btn icon width="56px" :disabled="!hasPreviousReview" @click="promptReviewChoice()">
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
				</v-btn-group>
			</v-col>
		</v-row>
		<v-row>
			<v-col v-for="(editor, index) in editors" :key="index" md="12" :lg="editors.length === 1 ? 12 : 6">
				<EditorCard :editor />
			</v-col>

			<v-col v-if="diffVisible" cols="12">
				<DiffViewer :originalContent :modifiedContent v-model="diffVisible" />
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

		<ConfirmDialog
			v-model="newReviewConfirmationDialogVisible"
			@confirm="confirmNewReview"
			title="Confirm New Review"
			color="primary"
			text="You have unsaved changes. Are you sure you want to start a new review?"
			submit="Yes" />
	</div>
</template>

<script lang="ts" setup>
import { toast } from "vuetify-sonner"

const editorStore = useEditorStore()
const reviewStore = useReviewStore()
const editors = computed(() => editorStore.editors)

//diff
const diffVisible = ref(false)
const selectedEditors = computed(() => editors.value.filter((editor) => editor.selected))
const originalContent = computed(() => selectedEditors.value[1]?.input)
const modifiedContent = computed(() => selectedEditors.value[0]?.input)

watch(selectedEditors, () => {
	if (selectedEditors.value.length < 2) {
		diffVisible.value = false
	}
})
const form = useTemplateRef("form")
const newReviewConfirmationDialogVisible = ref(false)

const showDiff = () => {
	if (editors.value.length == 2) {
		editors.value.forEach((editor) => (editor.selected = true))
	}

	if (selectedEditors.value.length === 2) {
		diffVisible.value = true
	} else {
		alert("Please select exactly 2 editors to compare.")
	}
}

const reviewsInDialog = ref<Review[]>([])
const hasPreviousReview = computed(
	() =>
		(reviewStore.reviews || []).filter(
			(review) =>
				review.user_id === reviewStore.currentReview.user_id && review.id !== reviewStore.currentReview.id
		).length > 0
)

const promptReviewChoice = () => {
	const reviews = quickSort(
		reviewStore.reviews?.filter(
			(review) =>
				review.user_id === reviewStore.currentReview.user_id && review.id !== reviewStore.currentReview.id
		) || [],
		(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
	)

	if (!reviews) return
	if (reviews.length > 1) {
		reviewsInDialog.value = reviews
	} else {
		addEditorFromReview(reviews[0]?.id)
	}
}

const addEditorFromReview = async (id?: string) => {
	reviewsInDialog.value = []
	if (!id) return

	const editors = await reviewStore.getEditorsFromReview(id)
	const review = reviewStore.reviews?.find((r) => r.id === id)

	editors.forEach((editor, i) => {
		editorStore.addEditor({
			...editor,
			title: editor.title || `Editor ${i + 1} - ${review?.title}`,
		})
	})
}
const newReview = () => {
	if (reviewStore.isTouched) {
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
	const validationObject = await form.value?.form?.validate()
	if (!validationObject?.valid) {
		toast.error("Please fix the errors before saving the review.")
		return
	}

	await reviewStore.saveReview()
}

const formatTimeAgo = (date: string) => {
	const now = new Date().getTime()
	const createdAt = new Date(date).getTime()
	const days = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24))
	const hours = Math.floor(((now - createdAt) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
	return `${days} days ${hours} hours`
}

const keyActions: { [key: string]: () => void } = {
	s: saveReview,
	n: newReview,
}

const handleKeydown = (event: KeyboardEvent) => {
	if (!event.ctrlKey) return
	const action = keyActions[event.key.toLowerCase()]
	if (action) {
		event.preventDefault()
		action()
	}
}

onMounted(() => {
	window.addEventListener("keydown", handleKeydown)
})

onUnmounted(() => {
	window.removeEventListener("keydown", handleKeydown)
})
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
