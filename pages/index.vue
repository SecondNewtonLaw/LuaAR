<template>
	<v-container>
		<v-row>
			<v-col cols="12" class="flex-column d-flex ga-lg-3">
				<v-btn color="primary" appendIcon="mdi-plus" @click="newReview">NEW REVIEW</v-btn>

				<CurrentReview ref="form" />
			</v-col>
		</v-row>
		<v-row>
			<v-col>
				<v-btn-group>
					<v-btn icon @click="editorStore.addEditor">
						<v-icon>mdi-plus</v-icon>
						<v-tooltip activator="parent" location="bottom">Add Editor</v-tooltip>
					</v-btn>
					<v-btn icon v-if="reviewed" :disabled="!hasPreviousReview" @click="promptReviewChoice">
						<v-icon>mdi-plus</v-icon>
						<v-tooltip activator="parent" location="bottom">Add Editor from Review</v-tooltip>
					</v-btn>
					<v-btn icon @click="editorStore.resetEditors">
						<v-icon>mdi-refresh</v-icon>
						<v-tooltip activator="parent" location="bottom" text="Reset Editors" />
					</v-btn>
					<v-btn icon @click="showDiff">
						<v-icon>mdi-file-compare</v-icon>
						<v-tooltip activator="parent" location="bottom">Show Diff</v-tooltip>
					</v-btn>
					<v-btn icon @click="reviewStore.saveReview">
						<v-icon>mdi-content-save</v-icon>
						<v-tooltip activator="parent" location="bottom">Save Review</v-tooltip>
					</v-btn>
				</v-btn-group>
			</v-col>
		</v-row>
		<v-row>
			<v-col :cols="editors.length > 1 ? 6 : 12" v-for="(editor, index) in editors" :key="index">
				<EditorCard :editor :index />
			</v-col>

			<v-col v-if="diffVisible" cols="12">
				<DiffViewer :originalContent="originalContent" v-model:modifiedContent="modifiedContent" />
			</v-col>
		</v-row>

		<VDialog :model-value="reviewsInDialog.length > 0" width="auto">
			<v-card
				max-width="400"
				prepend-icon="mdi-information"
				text="Select a review to add as an editor"
				title="Select Review"
			>
				<v-card-text>
					<v-list>
						<v-list-item
							v-for="review in reviewsInDialog"
							:key="review.id"
							@click="addEditorFromReview(review.id || '')"
						>
							<v-list-item-title>{{ review.title }}</v-list-item-title>
							<v-list-item-subtitle
								>{{ new Date(review.created_at).toLocaleString() }} by {{ review.user_id }}
							</v-list-item-subtitle>
						</v-list-item>
					</v-list>
				</v-card-text>
			</v-card>
		</VDialog>
	</v-container>
</template>

<script lang="ts" setup>
const editorStore = useEditorStore()
const reviewStore = useReviewStore()
const editors = computed(() => editorStore.editors)
const diffVisible = ref(false)
const originalContent = ref("")
const modifiedContent = ref("")
const form = ref<{ form: HTMLFormElement | null }>({ form: null })
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
	const reviews = reviewStore.reviews?.filter(
		(review) => review.user_id === reviewStore.currentReview.user_id && review.id !== reviewStore.currentReview.id
	)
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
		editorStore.addEditor((await reviewStore.getEditorsFromReview(review.id))[0])
	}
}
const newReview = () => {
	console.log(form.value.form)
	form.value?.form?.reset()
	reviewStore.newReview()
}

// onMounted(async () => {
// 	const response = await fetch("example.luau")
// 	editors.value[0].input = await response.text()
// })
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
