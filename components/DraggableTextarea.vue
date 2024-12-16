<template>
	<div class="draggable-container rounded" ref="draggable" @mousedown.stop="onMouseDown">
		<v-btn
			:icon="isLocked ? 'mdi-pin' : 'mdi-pin-outline'"
			class="pin-button"
			density="compact"
			variant="text"
			@click="toggleLock"></v-btn>
		<v-btn icon="mdi-close" class="close-button" density="compact" @click="close"></v-btn>
		<v-card class="pa-1">
			<v-textarea
				v-auto-focus
				variant="solo"
				hide-details
				label="Review"
				v-model="modelValue"
				auto-grow
				min-width="20rem" />
		</v-card>
	</div>
</template>

<script lang="ts" setup>
const modelValue = defineModel<string | null>()
const draggable = useTemplateRef("draggable")
const MARGIN = 20

const getInitialPosition = () => {
	const storedPosition = localStorage.getItem("position")
	return storedPosition ? JSON.parse(storedPosition) : { x: 50, y: 50 }
}

let initialPosition = getInitialPosition()

// Ensure initial positions are at least MARGIN px from the screen borders
initialPosition.x = Math.max(MARGIN, initialPosition.x)
initialPosition.y = Math.max(MARGIN, initialPosition.y)

const position = reactive(initialPosition)

let isDragging = false
let offset = { x: 0, y: 0 }

const isLocked = ref(false)

const onMouseDown = (event: MouseEvent) => {
	if (isLocked.value) return
	isDragging = true
	const currentX = position.x
	const currentY = position.y
	offset.x = event.clientX - currentX
	offset.y = event.clientY - currentY
	document.addEventListener("mousemove", onMouseMove)
	document.addEventListener("mouseup", onMouseUp)
}

const constrainPosition = () => {
	if (!draggable.value) return
	position.x = Math.min(window.innerWidth - draggable.value.offsetWidth - MARGIN, Math.max(MARGIN, position.x))
	position.y = Math.min(window.innerHeight - draggable.value.offsetHeight - MARGIN, Math.max(MARGIN, position.y))
	draggable.value.style.left = `${position.x}px`
	draggable.value.style.top = `${position.y}px`
}

const onMouseMove = (event: MouseEvent) => {
	if (!(isDragging && draggable.value)) return
	position.x = event.clientX - offset.x
	position.y = event.clientY - offset.y
	constrainPosition()
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

const toggleLock = () => {
	isLocked.value = !isLocked.value
}

onMounted(() => {
	if (!draggable.value) return
	draggable.value.style.left = `${position.x}px`
	draggable.value.style.top = `${position.y}px`
	window.addEventListener("resize", constrainPosition)
})

onUnmounted(() => {
	window.removeEventListener("resize", constrainPosition)
})
</script>

<style scoped lang="scss">
.draggable-container {
	position: fixed;
	padding: 1px;
	border: 1px solid rgba(255, 255, 255, 0.12);
	z-index: 2;
}

.cursor {
	cursor: move;
}

.close-button {
	position: absolute;
	top: -0.5rem;
	z-index: 3;
	right: -0.5rem;
}

.pin-button {
	position: absolute;
	top: -0.5rem;
	right: 1.5rem;
	z-index: 3;
}
</style>
