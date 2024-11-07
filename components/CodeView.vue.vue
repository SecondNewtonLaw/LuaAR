<template>
	<div>
		<v-select v-model="selectedLanguage" :items="languages" label="Select Language"></v-select>
		<MarkdownView :content="code" />
	</div>
</template>

<script lang="ts" setup>
const content = defineModel<string>("content")
const selectedLanguage = ref("lua")
const languages = ["lua", "ts"]

const code = computed(() => {
	return `\`\`\`${selectedLanguage.value}\n${content?.value ?? ""}\n\`\`\``
})
</script>
