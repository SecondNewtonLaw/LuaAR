<template>
	<v-chip :color="color">
		{{ text }}<template v-if="count !== null">: {{ count }}</template>
		<v-tooltip v-if="details?.length" activator="parent" location="bottom">
			<v-list rounded select-strategy="single-leaf" border>
				<v-list-item v-for="(line, index) in details" :key="index">
					<VListItemTitle>{{ index + 1 }}. {{ line }}</VListItemTitle>
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
:deep(.v-overlay__content) {
	--v-theme-surface-variant: transparent;
	--v-theme-on-surface-variant: 0, 0, 0;
}
</style>
