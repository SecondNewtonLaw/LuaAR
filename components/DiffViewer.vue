<template>
	<v-card>
		<v-card-title>
			Diff Viewer
			<v-spacer></v-spacer>
			<v-btn icon @click="visible = false">
				<v-icon>mdi-close</v-icon>
			</v-btn>
		</v-card-title>
		<v-card-text>
			<MonacoDiffEditor
				:original="originalContent"
				:model-value="modifiedContent"
				:options="{
					theme: 'vs-dark',
				}"
				lang="lua"
				class="editor" />
		</v-card-text>
	</v-card>
</template>

<script lang="ts" setup>
defineProps<{
	originalContent: string
	modifiedContent: string
}>()

const visible = defineModel<boolean>()
</script>

<style scoped lang="scss">
.editor {
	width: 100%;
	height: 60vh;
}
</style>
