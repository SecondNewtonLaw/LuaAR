<template>
	<v-card>
		<v-card-title>
			Editor {{ index + 1 }}

			<v-checkbox v-model="editor.selected" :label="'Select ' + (index + 1)" density="compact">
				<v-tooltip activator="parent" location="bottom">Select Editor</v-tooltip>
			</v-checkbox>
			<v-btn-group>
				<v-btn icon @click="$emit('toggleCollapse', index)">
					<v-icon>{{ editor.collapsed ? "mdi-chevron-down" : "mdi-chevron-up" }}</v-icon>
					<v-tooltip activator="parent" location="bottom">{{
						editor.collapsed ? "Expand" : "Collapse"
					}}</v-tooltip>
				</v-btn>
				<v-btn icon @click="$emit('removeEditor', index)">
					<v-icon>mdi-close</v-icon>
					<v-tooltip activator="parent" location="bottom">Remove Editor</v-tooltip>
				</v-btn>
				<v-btn icon @click="$emit('stripCode', index)">
					<v-icon>mdi-format-align-left</v-icon>
					<v-tooltip activator="parent" location="bottom">Strip Code</v-tooltip>
				</v-btn>
				<v-btn icon @click="$emit('formatCode', index)" :disabled="editor.input === '' || !tauri.isTauri">
					<v-icon>mdi-format-align-left</v-icon>
					<v-tooltip activator="parent" location="bottom">Format Code</v-tooltip>
				</v-btn>
			</v-btn-group>
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
</template>

<script lang="ts" setup>
import type { Editor } from "~/types"

const tauri = useTauri()
defineProps<{
	editor: Editor
	index: number
}>()

defineEmits<{
	removeEditor: [number]
	toggleCollapse: [number]
	stripCode: [number]
	formatCode: [number]
}>()
</script>

<style scoped lang="scss">
.editor {
	width: 100%;
	height: 60vh;
}

.v-btn-group {
	display: flex;
}

.v-btn {
	margin: 0 5px;
	border-radius: 0;
}
</style>
