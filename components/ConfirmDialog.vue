<template>
	<div>
		<v-dialog v-model="isDialogOpen" max-width="500">
			<v-card>
				<v-card-title class="headline">{{ title }}</v-card-title>
				<v-card-text>
					{{ text }}
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn @click="isDialogOpen = false">Cancel</v-btn>
					<v-btn color="red" @click=";(isDialogOpen = false) && emits('confirm')">{{ submit }}</v-btn>
				</v-card-actions>
			</v-card></v-dialog
		>
	</div>
</template>

<script lang="ts" setup>
const isDialogOpen = defineModel<boolean>()
const emits = defineEmits<{
	confirm: []
}>()
defineProps<{
	title: string
	text: string
	submit: string
}>()
</script>

<style></style>
