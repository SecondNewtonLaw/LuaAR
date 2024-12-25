<template>
	<v-menu open-on-hover attach>
		<template v-slot:activator="{ props }">
			<v-chip :color="color" tile rounded="lg" v-bind="props">
				{{ text }}<template v-if="count !== null">: {{ count }}</template>
			</v-chip>
		</template>

		<v-list rounded="lg" select-strategy="single-leaf" max-height="300" v-if="details">
			<v-list-item v-for="(line, index) in details" :key="index">
				<VListItemTitle>{{ line }}</VListItemTitle>
			</v-list-item>
		</v-list>
	</v-menu>
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
.v-tooltip__content {
	pointer-events: auto;
}
:deep(.v-overlay__content) {
	--v-theme-surface-variant: transparent;
	--v-theme-on-surface-variant: 0, 0, 0;
}
</style>
