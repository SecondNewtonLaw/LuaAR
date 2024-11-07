<template>
	<v-container>
		<v-row>
			<v-col>
				<h1>Home Page</h1>
				<p>
					This is the home page where you can input plain text in the textarea below. The content will be
					rendered as code, allowing you to count lines and detect any issues with the code.
				</p>
			</v-col>
		</v-row>
		<v-row>
			<v-col>
				<v-btn-toggle>
					<v-btn icon @click="addEditor">
						<v-icon>mdi-plus</v-icon>
						<v-tooltip activator="parent" location="bottom">Add Editor</v-tooltip>
					</v-btn>
					<v-btn icon @click="resetEditors">
						<v-icon>mdi-refresh</v-icon>
						<v-tooltip activator="parent" location="bottom">Reset Editors</v-tooltip>
					</v-btn>
					<v-btn icon @click="showDiff">
						<v-icon>mdi-file-compare</v-icon>
						<v-tooltip activator="parent" location="bottom">Show Diff</v-tooltip>
					</v-btn>
				</v-btn-toggle>
			</v-col>
		</v-row>
		<v-row>
			<v-col v-for="(editor, index) in editors" :key="index" :cols="editors.length > 1 ? 6 : 12">
				<v-card>
					<v-card-title>
						Editor {{ index + 1 }}

						<v-checkbox v-model="editor.selected" :label="'Select ' + (index + 1)" density="compact">
							<v-tooltip activator="parent" location="bottom">Select Editor</v-tooltip>
						</v-checkbox>
						<v-btn icon @click="toggleCollapse(index)">
							<v-icon>{{ editor.collapsed ? "mdi-chevron-down" : "mdi-chevron-up" }}</v-icon>
							<v-tooltip activator="parent" location="bottom">{{
								editor.collapsed ? "Expand" : "Collapse"
							}}</v-tooltip>
						</v-btn>
						<v-btn icon @click="removeEditor(index)">
							<v-icon>mdi-close</v-icon>
							<v-tooltip activator="parent" location="bottom">Remove Editor</v-tooltip>
						</v-btn>
						<v-btn icon @click="stripCode(index)">
							<v-icon>mdi-format-align-left</v-icon>
							<v-tooltip activator="parent" location="bottom">Strip Code</v-tooltip>
						</v-btn>
						<!-- format -->
						<v-btn icon @click="formatCode(index)" :disabled="editor.input === '' || !tauri.isTauri">
							<v-icon>mdi-format-align-left</v-icon>
							<v-tooltip activator="parent" location="bottom">Format Code</v-tooltip>
						</v-btn>
					</v-card-title>
					<v-expand-transition>
						<v-card-text v-show="!editor.collapsed">
							<MonacoEditor
								:options="{
									theme: 'vs-dark',
									formatOnPaste: true,
									formatOnType: true,
									language: 'lua',
									autoIndent: 'full',
								}"
								lang="lua"
								v-model="editor.input"
								class="editor"
							/>
						</v-card-text>
					</v-expand-transition>
				</v-card>
			</v-col>
			<v-col cols="12" v-if="diffVisible">
				<v-card>
					<v-card-title>Diff Viewer</v-card-title>
					<v-card-text>
						<MonacoDiffEditor
							:original="originalContent"
							v-model="modifiedContent"
							:options="{
								theme: 'vs-dark',
							}"
							class="editor"
						/>
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>
	</v-container>
</template>

<script lang="ts" setup>
const editors = ref([{ input: "", collapsed: false, selected: false }])
const diffVisible = ref(false)
const originalContent = ref("")
const modifiedContent = ref("")
const tauri = useTauri()
const addEditor = () => {
	editors.value.push({ input: "", collapsed: false, selected: false })
}

const resetEditors = () => {
	editors.value = [{ input: "", collapsed: false, selected: false }]
}

const toggleCollapse = (index: number) => {
	editors.value[index].collapsed = !editors.value[index].collapsed
}

const removeEditor = (index: number) => {
	editors.value.splice(index, 1)
}

const showDiff = () => {
	const selectedEditors = editors.value.filter((editor) => editor.selected)
	if (selectedEditors.length === 2) {
		originalContent.value = selectedEditors[0].input
		modifiedContent.value = selectedEditors[1].input
		diffVisible.value = true
	} else {
		alert("Please select exactly 2 editors to compare.")
	}
}

const formatCode = async (index: number) => {
	const editor = editors.value[index]
	const input = editor.input

	editor.input = input + "test"
}
const stripCode = (index: number) => {
	let code = editors.value[index].input

	code = code.replace(/--\[\[[\s\S]*?\]\]/g, "")
	code = code.replace(/--.*$/gm, "")

	// Remove empty lines
	editors.value[index].input = code
		.split("\n")
		.filter((line) => line.trim() !== "")
		.join("\n")
}

onMounted(async () => {
	const response = await fetch("example.luau")
	editors.value[0].input = await response.text()
})
</script>

<style scoped lang="scss">
.editor {
	width: 100%;
	height: 60vh;
}

.v-btn-toggle {
	display: flex;
	justify-content: center;
}

.v-btn {
	margin: 0 5px;
	border-radius: 0;
}
</style>
