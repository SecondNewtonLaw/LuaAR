<template>
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
</template>

<script lang="ts" setup>
defineProps<{
	originalContent: string
}>()

const modifiedContent = defineModel<string>("modifiedContent")
</script>

<style scoped lang="scss">
.editor {
	width: 100%;
	height: 60vh;
}
</style>
