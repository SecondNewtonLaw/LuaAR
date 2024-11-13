<template>
	<v-card>
		<v-card-title>
			<div class="title-content">
				Editor
				<v-checkbox v-model="editor.selected" density="compact" hide-details>
					<v-tooltip activator="parent" location="bottom">Select Editor</v-tooltip>
				</v-checkbox>
				<!-- Title input -->
				<v-text-field
					v-model="editor.title"
					variant="solo"
					label="Title"
					placeholder="Enter title"
					density="compact"
					prepend-inner-icon="mdi-text"
					single-line
					hide-details></v-text-field>
			</div>

			<VToolbar flat color="transparent">
				<v-btn-group>
					<v-btn @click="editorStore.stripCode(editor)" :disabled="editor.input === ''"> Strip Code </v-btn>
					<v-btn @click="editorStore.formatCode(editor)" :disabled="editor.input === '' || !tauri.isTauri">
						Format Code
					</v-btn>
					<!-- Remove logs -->
					<v-btn @click="editorStore.removeLogs(editor)" :disabled="editor.input === ''">
						Remove Logs
						<v-tooltip activator="parent" location="bottom">Remove all prints, warns, and errors</v-tooltip>
					</v-btn>
					<!-- Lint
					<v-btn icon @click="editorStore.lintCode(editor)" :disabled="editor.input === '' || !tauri.isTauri">
						<v-icon>mdi-alert-circle</v-icon>
						<v-tooltip activator="parent" location="bottom">Lint Code</v-tooltip>
					</v-btn> -->
				</v-btn-group>
				<v-btn-group>
					<v-btn icon @click="editorStore.toggleCollapse(editor)">
						<v-icon>{{ editor.collapsed ? "mdi-chevron-down" : "mdi-chevron-up" }}</v-icon>
						<v-tooltip activator="parent" location="bottom">{{
							editor.collapsed ? "Expand" : "Collapse"
						}}</v-tooltip>
					</v-btn>
					<v-btn icon @click="editorStore.removeEditor(editor)">
						<v-icon>mdi-close</v-icon>
						<v-tooltip activator="parent" location="bottom">Remove Editor</v-tooltip>
					</v-btn>
					<!-- Duplicate -->
					<v-btn icon @click="duplicateEditor">
						<v-icon>mdi-content-copy</v-icon>
						<v-tooltip activator="parent" location="bottom">Duplicate Editor</v-tooltip>
					</v-btn>
				</v-btn-group>
			</VToolbar>
		</v-card-title>
		<v-expand-transition>
			<v-card-text v-show="!editor.collapsed">
				<div class="code-info-chips">
					<CodeInfoChip
						v-if="codeInfoCount.definitive.length > 0"
						:count="codeInfoCount.definitive.length"
						color="error"
						text="Deprecated API found"
						:details="codeInfoCount.definitive" />
					<CodeInfoChip
						v-if="codeInfoCount.warning.length > 0"
						:count="codeInfoCount.warning.length"
						color="warning"
						text="Warning: Deprecated API found"
						:details="codeInfoCount.warning" />
					<CodeInfoChip
						v-if="codeInfoCount.incorrect.length > 0"
						:count="codeInfoCount.incorrect.length"
						color="error"
						text="Incorrect API usage"
						:details="codeInfoCount.incorrect" />
					<CodeInfoChip
						v-if="codeInfoCount.info.length > 0"
						v-for="(info, index) in codeInfoCount.info"
						:key="index"
						:count="null"
						color="info"
						:text="info" />
				</div>
				<MonacoEditor
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
						autoIndent: 'full',
						cursorBlinking: 'smooth',
						cursorSmoothCaretAnimation: 'on',
						lineNumbers: 'on',
						mouseWheelZoom: true,
					}"
					lang="lua"
					v-model="editor.input"
					:class="['editor']" />
			</v-card-text>
		</v-expand-transition>
	</v-card>
</template>

<script lang="ts" setup>
const tauri = useTauri()
const editorStore = useEditorStore()

const props = defineProps<{
	editor: Editor
}>()
const deprecatedAPI = ref([
	/^\s*(wait|delay|spawn)\s*(\([^\)]*\))?\s*$/i,
	/\bSetPrimaryPartCFrame\b/i,
	/\bgame\.Chat\b/i,
	/\bGetService\s*\(\s*["']Chat["']\s*\)/i,
])

const warnDeprecatedAPI = ref([
	/^\s*LoadAnimation\s*(\([^\)]*\))?\s*$/i,
	/\bBodyVelocity\b/i,
	/\bBodyGyro\b/i,
	/\bLoadAnimation\b/i,
])

const incorrectAPI = ref([/\bFindFirst\w*\s*\([^\)]*\)\s*:/i])

const codeInfoCount = computed(() => {
	const input = props.editor.input
	const strippedInput = stripInput(input)
	return {
		definitive: strippedInput.split("\n").filter((line) => deprecatedAPI.value.some((regex) => regex.test(line))),
		warning: strippedInput.split("\n").filter((line) => warnDeprecatedAPI.value.some((regex) => regex.test(line))),
		incorrect: strippedInput.split("\n").filter((line) => incorrectAPI.value.some((regex) => regex.test(line))),
		info: [
			stripLoggingStatements(strippedInput).split("\n").length < 200 ? "Code is less than 200 LOC" : null,
			`Code has ${countWhitelines(input)} whitelines`,
			`Code has ${countComments(input)} comments`,
			`Code has ${countLogs(input)} logs`,
		].filter((_) => _ !== null),
	}
})

const duplicateEditor = (event: MouseEvent) => {
	if (event.ctrlKey) return navigator.clipboard.writeText(props.editor.input)

	editorStore.editors.push({ ...props.editor })
}
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

.code-info-chips {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
	margin-bottom: 0.5rem;
}
</style>

<style lang="scss">
.matched-class {
	/* Add your styles for matched words here */
	color: red !important;
	font-weight: bold;
}
</style>
