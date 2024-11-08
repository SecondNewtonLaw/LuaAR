<template>
	<v-container>
		<v-row>
			<v-col>
				<v-btn color="primary" appendIcon="mdi-plus" @click="reviewStore.newReview">NEW REVIEW</v-btn>

				<CurrentReview />
			</v-col>
		</v-row>
		<v-row>
			<v-col>
				<v-btn-group>
					<v-btn icon @click="editorStore.addEditor">
						<v-icon>mdi-plus</v-icon>
						<v-tooltip activator="parent" location="bottom">Add Editor</v-tooltip>
					</v-btn>
					<v-btn icon @click="editorStore.resetEditors">
						<v-icon>mdi-refresh</v-icon>
						<v-tooltip activator="parent" location="bottom">Reset Editors</v-tooltip>
					</v-btn>
					<v-btn icon @click="showDiff">
						<v-icon>mdi-file-compare</v-icon>
						<v-tooltip activator="parent" location="bottom">Show Diff</v-tooltip>
					</v-btn>
					<!-- Save review -->
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
	</v-container>
</template>

<script lang="ts" setup>
const editorStore = useEditorStore()
const reviewStore = useReviewStore()
const editors = computed(() => editorStore.editors)
const diffVisible = ref(false)
const originalContent = ref("")
const modifiedContent = ref("")

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
