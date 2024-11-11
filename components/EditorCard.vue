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
					<v-btn @click="editorStore.stripCode(editor)"> Strip Code </v-btn>
					<v-btn @click="editorStore.formatCode(editor)" :disabled="editor.input === '' || !tauri.isTauri">
						Format Code
					</v-btn>
					<!-- Remove logs -->
					<v-btn @click="editorStore.removeLogs(editor)">
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
				<v-chip v-if="codeInfoCount.definitive.length > 0" color="error" text-color="white">
					Deprecated API found: {{ codeInfoCount.definitive.length }}
					<v-tooltip activator="parent" location="bottom">
						<v-list>
							<v-list-item v-for="(line, index) in codeInfoCount.definitive" :key="index">
								<VListItemTitle>{{ line }}</VListItemTitle>
							</v-list-item>
						</v-list>
					</v-tooltip>
				</v-chip>

				<v-chip v-if="codeInfoCount.warning.length > 0" color="warning" text-color="white">
					Warning: Deprecated API found: {{ codeInfoCount.warning.length }}
					<v-tooltip activator="parent" location="bottom">
						<v-list>
							<v-list-item v-for="(line, index) in codeInfoCount.warning" :key="index">
								<VListItemTitle>{{ line }}</VListItemTitle>
							</v-list-item>
						</v-list>
					</v-tooltip>
				</v-chip>

				<v-chip
					v-if="codeInfoCount.info.length > 0"
					color="info"
					text-color="white"
					v-for="info in codeInfoCount.info">
					{{ info }}
				</v-chip>

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
	/^\s*wait\s*(\([^\)]*\))?\s*$/i,
	/^\s*spawn\s*(\([^\)]*\))?\s*$/i,
	/\bSetPrimaryPartCFrame\b/i,
])

const warnDeprecatedAPI = ref([
	/^\s*LoadAnimation\s*(\([^\)]*\))?\s*$/i,
	/\bBodyVelocity\b/i,
	/\bBodyGyro\b/i,
	/\bLoadAnimation\b/i,
])

const codeInfoCount = computed(() => {
	const input = props.editor.input
	return {
		definitive: input.split("\n").filter((line) => deprecatedAPI.value.some((regex) => regex.test(line))),
		warning: input.split("\n").filter((line) => warnDeprecatedAPI.value.some((regex) => regex.test(line))),
		info: [
			stripInput(input).split("\n").length < 200 ? "Code is less than 200 LOC" : null,
			`Code has ${countWhitelines(input)} whitelines`,
			`Code has ${countComments(input)} comments`,
		].filter((_) => _),
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
</style>

<style lang="scss">
.matched-class {
	/* Add your styles for matched words here */
	color: red !important;
	font-weight: bold;
}
</style>
