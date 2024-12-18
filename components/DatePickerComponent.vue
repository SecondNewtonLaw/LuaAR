<template>
	<v-date-picker
		hide-header
		show-adjacent-months
		v-model="modelValue"
		:label="label"
		color="primary"
		landscape></v-date-picker>
</template>

<script lang="ts" setup>
const modelValue = defineModel<Date | null>()
defineProps<{
	label: string
}>()
</script>

<style scoped lang="scss"></style>
