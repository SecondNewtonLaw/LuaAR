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
					<v-btn icon @click="editorStore.stripCode(index)">
						<v-icon>mdi-format-align-left</v-icon>
						<v-tooltip activator="parent" location="bottom">Strip Code</v-tooltip>
					</v-btn>
					<v-btn
						icon
						@click="editorStore.formatCode(index)"
						:disabled="editor.input === '' || !tauri.isTauri"
					>
						<v-icon>mdi-format-align-left</v-icon>
						<v-tooltip activator="parent" location="bottom">Format Code</v-tooltip>
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
				</v-btn-group>
			</VToolbar>
		</v-card-title>
		<v-expand-transition>
			<v-card-text v-show="!editor.collapsed">
				<MonacoEditor
					:options="{
						theme: 'vs-dark',
						formatOnPaste: true,
						formatOnType: true,
						language: editorStore.currentLanguage,
						autoIndent: 'full',
					}"
					:lang="editorStore.currentLanguage"
					v-model="editor.input"
					class="editor"
				/>
			</v-card-text>
		</v-expand-transition>
	</v-card>
</template>

<script lang="ts" setup>
import type { Editor } from "~/types"

const tauri = useTauri()
const editorStore = useEditorStore()
defineProps<{
	editor: Editor
	index: number
}>()
</script>

<style scoped lang="scss">
.editor {
	width: 100%;
	height: 60vh;
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
