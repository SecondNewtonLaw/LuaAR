<template>
	<v-card>
		<v-card-title>
			<!-- Title input -->
			<v-row dense>
				<v-col>
					<v-text-field
						prefix="Editor"
						persistent-placeholder
						v-model="editor.title"
						:readonly="isLintResult"
						variant="solo"
						label="Title"
						placeholder="Enter title"
						density="compact"
						prepend-inner-icon="mdi-text"
						single-line
						hide-details />
				</v-col>
				<v-col cols="auto" class="d-flex align-center ga-2 mr-1">
					<v-select
						:model-value="editor.lang || settingsStore.defaultLanguage"
						@update:model-value="editor.lang = $event"
						:items="settingsStore.languages"
						label="Language"
						variant="solo"
						single-line
						max-width="12rem"
						class="flex-xl-0-0"
						density="compact"
						prepend-inner-icon="mdi-code-tags"
						hide-details />
					<v-checkbox v-model="editor.selected" density="compact" hide-details>
						<v-tooltip activator="parent" location="bottom">Select Editor</v-tooltip>
					</v-checkbox>
				</v-col>
				<v-col cols="12">
					<VToolbar flat color="transparent" density="compact">
						<v-btn-group variant="tonal" color="primary" v-if="!isLintResult">
							<v-btn class="ml-0" @click="editorStore.stripCode(editor)" :disabled="editor.input === ''">
								Strip Code
							</v-btn>
							<v-btn @click="formatCode(editor)" :disabled="editor.input === ''"> Format Code </v-btn>
							<!-- Remove logs -->
							<v-btn @click="editorStore.removeLogs(editor)" :disabled="editor.input === ''">
								Remove Logs
								<v-tooltip activator="parent" location="bottom"
									>Remove all prints, warns, and errors</v-tooltip
								>
							</v-btn>
							<!-- Lint -->
							<v-btn
								@click="editorStore.lintCode(editor)"
								:disabled="editor.input === '' || !tauri || editor.lang !== 'lua'">
								Lint Code
							</v-btn>
							<v-btn
								@click="editorStore.applyLintFixes(editor)"
								:disabled="editor.input === '' || !tauri || editor.lang !== 'lua'">
								Apply Lint Fixes
							</v-btn>
						</v-btn-group>
						<v-spacer />
						<v-btn-group variant="elevated" class="ga-2">
							<v-btn icon density="comfortable" @click="editorStore.toggleCollapse(editor)">
								<v-icon>{{ editor.collapsed ? "mdi-chevron-down" : "mdi-chevron-up" }}</v-icon>
								<v-tooltip activator="parent" location="bottom">{{
									editor.collapsed ? "Expand" : "Collapse"
								}}</v-tooltip>
							</v-btn>
							<v-btn icon density="comfortable" @click="editorStore.removeEditor(editor)">
								<v-icon>mdi-close</v-icon>
								<v-tooltip activator="parent" location="bottom">Remove Editor</v-tooltip>
							</v-btn>
							<!-- Duplicate -->
							<v-btn class="mr-0" density="comfortable" icon @click="duplicateEditor">
								<v-icon>mdi-content-copy</v-icon>
								<v-tooltip activator="parent" location="bottom">Duplicate Editor</v-tooltip>
							</v-btn>
						</v-btn-group>
					</VToolbar>
				</v-col>
			</v-row>
		</v-card-title>
		<v-expand-transition>
			<v-card-text v-if="!editor.collapsed">
				<div class="d-flex ga-2 mb-2 flex-wrap" v-if="!isLintResult">
					<CodeInfoChip
						v-if="codeInfoCount.definitive.length > 0"
						:count="codeInfoCount.definitive.length"
						color="error"
						text="Deprecated API found"
						:details="codeInfoCount.definitive" />

					<CodeInfoChip
						v-if="codeInfoCount.auto.length > 0"
						:count="codeInfoCount.auto.length"
						color="warning"
						text="AUTO-DEPRECATED API found"
						:details="codeInfoCount.auto" />
					<CodeInfoChip
						v-if="codeInfoCount.incorrect.length > 0"
						:count="codeInfoCount.incorrect.length"
						color="error"
						text="Incorrect API usage"
						:details="codeInfoCount.incorrect" />

					<!-- LOC -->
					<CodeInfoChip :count="loc" :color="loc < settingsStore.loc ? 'warning' : 'success'" text="LOC" />

					<!-- Nesting -->
					<CodeInfoChip
						text="Nesting"
						:count="nesting.maxDepth"
						:color="
							nesting.ratio > 1.8
								? 'error'
								: nesting.ratio > 1.3 || nesting.maxDepth > 4
								? 'warning'
								: 'success'
						"
						:details="Object.entries(nesting).map(([key, value]) => `${key}: ${value}`)" />
					<!-- LINT -->
					<CodeInfoChip
						v-if="lintResult"
						:count="lintCount"
						:color="lintCount <= 5 ? 'success' : lintCount < 10 ? 'warning' : 'error'"
						:details="lintResultMessages"
						text="Lint" />

					<!-- Comments -->
					<CodeInfoChip
						:count="comments"
						:color="comments <= 30 ? 'error' : comments <= 50 ? 'warning' : 'success'"
						text="Comments" />

					<CodeInfoChip
						v-if="codeInfoCount.info.length > 0"
						v-for="(info, index) in codeInfoCount.info"
						:key="index"
						color="info"
						:text="info" />
				</div>

				<MonacoEditor
					ref="monacoEditor"
					:options="{
						theme: 'vs-dark',
						dropIntoEditor: {
							enabled: true,
							showDropSelector: 'afterDrop',
						},
						formatOnPaste: true,
						formatOnType: true,
						minimap: {
							enabled: false,
						},
						wordWrap: 'on',

						autoIndent: 'full',
						cursorBlinking: 'smooth',
						cursorSmoothCaretAnimation: 'on',
						lineNumbers: 'on',
						mouseWheelZoom: true,
					}"
					:lang="editor.lang || settingsStore.defaultLanguage"
					v-model="editor.input"
					class="editor" />
			</v-card-text>
		</v-expand-transition>
	</v-card>
</template>

<script lang="ts" setup>
import { toast } from "vuetify-sonner"

const tauri = isTauri()
const editorStore = useEditorStore()
const settingsStore = useSettingsStore()
const monacoEditor = useTemplateRef("monacoEditor")

const props = defineProps<{
	editor: Editor
}>()

const isLintResult = computed(() => props.editor.title?.toLowerCase().includes("lint"))

const loc = computed(() => stripLoggingStatements(stripInput(props.editor), props.editor.lang).split("\n").length)
const lintResult = ref<LintResult | null>(null)
const lintCount = computed(() =>
	lintResult.value ? Object.values(lintResult.value.summary).reduce((a, b) => a + b, 0) : 0
)
const lintResultMessages = computed(() => {
	if (!lintResult.value) return []
	//LintResult .details has record of string, {message: string}, show all messages
	return Object.values(lintResult.value.details)
		.map((detail) => detail.flatMap((d) => `${d.lineNumber}: ${d.message}`))
		.flat()
})
const comments = computed(() => countComments(props.editor))
const nesting = computed(() => countNesting(props.editor))

const codeInfoCount = computed(() => {
	const strippedInput = stripInput(props.editor)

	return {
		definitive: outputFilter(strippedInput, definitiveDeprecated),
		incorrect: outputFilter(strippedInput, incorrectAPI),
		auto: outputFilter(strippedInput, autoGeneratedDeprecatedAPI.value),
		info: [
			`Code has ${countWhitelines(props.editor)} whitelines`,
			`Code has ${countLogs(props.editor)} logs`,
		].filter((_) => _ !== null),
	}
})

const duplicateEditor = (event: MouseEvent) => {
	if (event.ctrlKey) return navigator.clipboard.writeText(props.editor.input)

	editorStore.editors.push({ ...props.editor })
}

const formatCode = async (editor: Editor) => {
	monacoEditor.value?.$editor?.getAction("editor.action.formatDocument")?.run()
	if (editor.lang !== "lua") return
	if (!tauri) return toast.error("Could not format code")

	editorStore.formatCode(editor)
}

const init = ref(true)
const onInit = async () => {
	if (props.editor.input.trim() === "" || !props.editor.input) return (lintResult.value = null)
	if (props.editor.lang !== "lua") return
	if (!tauri) return toast.error("Could not format code")
	init.value = false

	await editorStore.formatCode(props.editor)
	lintResult.value = await processLintResult(props.editor)
}

onMounted(async () => {
	init.value = true
	await nextTick()

	monacoEditor.value?.$editor?.onDidPaste(() => {
		onInit()
		console.log("onInit from onDidPaste")
	})
})
watch(
	() => props.editor.input,
	() => {
		if (!init.value) return
		console.log("onInit from watch")
		onInit()
	},
	{
		immediate: true,
	}
)
</script>

<style scoped lang="scss">
.editor {
	width: 100%;
	height: 80vh;
}

.v-btn {
	margin: 0 5px;
	border-radius: 0;
}
</style>
