<template>
	<v-chip :color="color">
		{{ text }} <template v-if="count">: {{ count }}</template>
		<v-tooltip v-if="details?.length" activator="parent" location="bottom">
			<v-list>
				<v-list-item v-for="(line, index) in details" :key="index">
					<VListItemTitle>{{ line }}</VListItemTitle>
				</v-list-item>
			</v-list>
		</v-tooltip>
	</v-chip>
</template>

<script lang="ts" setup>
defineProps<{
	color: string
	text: string
	count: number | null
	details?: string[]
}>()
</script>

<style scoped lang="scss">
/* Add any specific styles for CodeInfoChip here */
</style>
