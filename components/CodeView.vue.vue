<template>
	<v-expansion-panels>
		<v-expansion-panel>
			<v-expansion-panel-title>Code View </v-expansion-panel-title>
			<v-expansion-panel-text>
				<v-select
					v-model="selectedLanguage"
					:items="languages"
					label="Select Language"
				></v-select>
				<MarkdownView :content="code" />
			</v-expansion-panel-text>
		</v-expansion-panel>
	</v-expansion-panels>
</template>

<script lang="ts" setup>
const content = defineModel<string>("content")
const selectedLanguage = ref("lua")
const languages = ["lua", "ts"]
const code = computed(() => {
	return `\`\`\`${selectedLanguage.value}\n${content?.value ?? ""}\n\`\`\``
})
</script>
