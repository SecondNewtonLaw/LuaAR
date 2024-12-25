<template>
	<v-card flat class="pa-0 ma-0">
		<v-card-title class="pa-0 ma-0">{{ title }}: {{ total }}</v-card-title>

		<v-card-text class="pa-0">
			<v-sparkline
				:color="color"
				height="100"
				padding="24"
				auto-draw-easing="ease-in-out"
				:auto-draw-duration="Math.random() * 500 + 500"
				auto-draw
				stroke-linecap="round"
				smooth
				:model-value="series"></v-sparkline>
		</v-card-text>
	</v-card>
</template>

<script lang="ts" setup>
defineProps<{
	title: string
	total: number

	color: string
	series: number[]
}>()
</script>

<style scoped lang="scss"></style>
