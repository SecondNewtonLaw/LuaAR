<template>
	<div v-if="modelValue">
		<v-menu
			close-on-back
			v-model="menu"
			:close-on-content-click="false"
			transition="scale-transition"
			offset-y
			min-width="auto">
			<template v-slot:activator="{ props }">
				<v-text-field
					:model-value="modelValue.toLocaleDateString()"
					:label="label"
					hide-details
					variant="solo-filled"
					density="comfortable"
					prepend-inner-icon="mdi-calendar"
					readonly
					v-bind="props"></v-text-field>
			</template>
			<v-date-picker
				v-model="modelValue"
				hide-header
				:active-picker.sync="activePicker"
				min="2015-01-01"
				max="2045-12-31"
				@change="save"></v-date-picker>
		</v-menu>
	</div>
</template>

<script lang="ts" setup>
const modelValue = defineModel<Date | null>()

withDefaults(defineProps<{ label: string }>(), {
	label: "Date",
})
const menu = ref(false)
const activePicker = ref<string | null>(null)

const save = () => {
	// handle date selection
	menu.value = false
}
</script>

<style scoped lang="scss"></style>
