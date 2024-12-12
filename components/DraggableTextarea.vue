<template>
	<div class="draggable-container rounded" ref="draggable" @mousedown.stop="onMouseDown">
		<v-btn icon="mdi-close" class="close-button" density="comfortable" @click="close"></v-btn>
		<v-card class="pa-1">
			<v-textarea
				variant="solo"
				hide-details
				label="Review"
				v-model="modelValue"
				auto-grow
				min-width="20rem"></v-textarea>
		</v-card>
	</div>
</template>

<script lang="ts" setup>
const modelValue = defineModel<string | null>()
const draggable = useTemplateRef("draggable")
const initialPosition = localStorage.getItem("position")
	? JSON.parse(localStorage.getItem("position")!)
	: { x: 50, y: 50 }

// Ensure initial positions are within 10% to 90%
initialPosition.x = Math.min(90, Math.max(10, initialPosition.x))
initialPosition.y = Math.min(90, Math.max(10, initialPosition.y))

const position = reactive(initialPosition)

let isDragging = false
let offset = { x: 0, y: 0 }

const onMouseDown = (event: MouseEvent) => {
	isDragging = true
	const currentX = (position.x / 100) * window.innerWidth
	const currentY = (position.y / 100) * window.innerHeight
	offset.x = event.clientX - currentX
	offset.y = event.clientY - currentY
	document.addEventListener("mousemove", onMouseMove)
	document.addEventListener("mouseup", onMouseUp)
}

const onMouseMove = (event: MouseEvent) => {
	if (!(isDragging && draggable.value)) return
	const newX = event.clientX - offset.x
	const newY = event.clientY - offset.y
	let xPercent = (newX / window.innerWidth) * 100
	let yPercent = (newY / window.innerHeight) * 100
	// Constrain positions to 10% - 90% for both x and y
	position.x = Math.min(90, Math.max(10, xPercent))
	position.y = Math.min(90, Math.max(10, yPercent))
	draggable.value.style.left = `${position.x}%`
	draggable.value.style.top = `${position.y}%`
}

const onMouseUp = () => {
	isDragging = false
	document.removeEventListener("mousemove", onMouseMove)
	document.removeEventListener("mouseup", onMouseUp)
	localStorage.setItem("position", JSON.stringify(position))
}

const close = () => {
	draggable.value?.style.setProperty("display", "none")
}

onMounted(() => {
	if (!draggable.value) return
	const currentX = (position.x / 100) * window.innerWidth
	const currentY = (position.y / 100) * window.innerHeight
	draggable.value.style.left = `${currentX}px`
	draggable.value.style.top = `${currentY}px`
})
</script>

<style scoped>
.draggable-container {
	position: fixed;
	padding: 1px;
	border: 1px solid rgba(255, 255, 255, 0.12);
	transform: translate(-50%, -50%);
	z-index: 2;
	cursor: move;
}

.close-button {
	position: absolute;
	top: -0.5rem;
	z-index: 3;
	right: -0.5rem;
}
</style>
