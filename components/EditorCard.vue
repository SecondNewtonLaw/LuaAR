<template>
	<v-card>
		<v-card-title>
			<div class="title-content">
				Editor {{ index + 1 }}
				<v-checkbox v-model="editor.selected" density="compact" hide-details>
					<v-tooltip activator="parent" location="bottom">Select Editor</v-tooltip>
				</v-checkbox>
			</div>

			<VToolbar>
				<v-btn-group>
					<v-btn @click="editorStore.stripCode(index)"> Strip Code </v-btn>
					<v-btn @click="editorStore.formatCode(index)" :disabled="editor.input === '' || !tauri.isTauri">
						Format Code
					</v-btn>
					<!-- Lint -->
					<v-btn icon @click="editorStore.lintCode(index)" :disabled="editor.input === '' || !tauri.isTauri">
						<v-icon>mdi-alert-circle</v-icon>
						<v-tooltip activator="parent" location="bottom">Lint Code</v-tooltip>
					</v-btn>
				</v-btn-group>
				<v-btn-group>
					<v-btn icon @click="editorStore.toggleCollapse(index)">
						<v-icon>{{ editor.collapsed ? "mdi-chevron-down" : "mdi-chevron-up" }}</v-icon>
						<v-tooltip activator="parent" location="bottom">{{
							editor.collapsed ? "Expand" : "Collapse"
						}}</v-tooltip>
					</v-btn>
					<v-btn icon @click="editorStore.removeEditor(index)">
						<v-icon>mdi-close</v-icon>
						<v-tooltip activator="parent" location="bottom">Remove Editor</v-tooltip>
					</v-btn>
					<!-- Duplicate -->
					<v-btn icon @click="duplicateEditor(index)">
						<v-icon>mdi-content-copy</v-icon>
						<v-tooltip activator="parent" location="bottom">Duplicate Editor</v-tooltip>
					</v-btn>
				</v-btn-group>
			</VToolbar>
		</v-card-title>
		<v-expand-transition>
			<v-card-text v-show="!editor.collapsed">
				<!-- Deprecated -->
				<div v-if="deprecatedCount > 0">Deprecated API found: {{ deprecatedCount }}</div>
				<MonacoEditor
					:options="{
						theme: 'customTheme',
						dropIntoEditor: {
							enabled: true,
							showDropSelector: 'afterDrop',
						},
						formatOnPaste: true,
						formatOnType: true,

						autoIndent: 'full',
						cursorBlinking: 'smooth',
						cursorSmoothCaretAnimation: 'on',
						lineNumbers: 'on',
						mouseWheelZoom: true,
					}"
					lang="lua"
					v-model="editor.input"
					class="editor"
				/>
			</v-card-text>
		</v-expand-transition>
	</v-card>
</template>

<script lang="ts" setup>
const tauri = useTauri()
const editorStore = useEditorStore()

defineProps<{
	editor: Editor
	index: number
}>()
const deprecatedAPI = ref([
	/^\s*wait\s*(\([^\)]*\))?\s*$/i, // Detects `wait`, `wait()`, and `wait(with param)`
])

const deprecatedCount = ref(0)
const applyRegexCheck = (container: HTMLElement) => {
	const viewLines = container.querySelectorAll<HTMLSpanElement>(".view-line span")
	viewLines.forEach((line) => {
		const words = line.textContent?.split(/\s+/).filter((word) => word.length > 0) || []
		words.forEach((word, index) => {
			const span = line.children[index] as HTMLElement
			if (!span) return
			const matches = deprecatedAPI.value.some((regex) => regex.test(word))
			if (matches) {
				span.classList.add("matched-class")
				console.log("Matched word:", word)
				deprecatedCount.value++
			} else {
				span.classList.remove("matched-class")
			}
		})
	})
}

let debounceTimeout: ReturnType<typeof setTimeout> | null = null

const duplicateEditor = (index: number) => {
	editorStore.editors.push({
		input: editorStore.editors[index].input,
		selected: false,
		collapsed: false,
	})
}

onMounted(async () => {
	onBeforeUnmount(() => {
		observer.disconnect()
		if (debounceTimeout) {
			clearTimeout(debounceTimeout)
		}
	})
	await new Promise((resolve) => setTimeout(resolve, 1000))
	const editorContainer = document.querySelector<HTMLElement>(".editor")
	if (!editorContainer) return

	const observer = new MutationObserver((mutations) => {
		if (debounceTimeout) {
			clearTimeout(debounceTimeout)
		}
		debounceTimeout = setTimeout(() => {
			mutations.forEach((mutation) => {
				if (mutation.type === "childList") {
					deprecatedCount.value = 0
					applyRegexCheck(editorContainer)
				}
			})
		}, 500)
	})

	observer.observe(editorContainer, {
		childList: true,
		subtree: true,
	})
})
</script>

<style scoped lang="scss">
.editor {
	width: 100%;
	height: 75vh;
}

.title-content {
	display: flex;
	gap: 0.5rem;
	align-items: center;
}

.v-toolbar :deep(div) {
	justify-content: space-between;
}

.v-btn {
	margin: 0 5px;
	border-radius: 0;
}
</style>

<style lang="scss">
.matched-class {
	/* Add your styles for matched words here */
	color: red !important;
	font-weight: bold;
}
</style>
