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
initialPosition.x = Math.max(MARGIN, initialPosition.x)
initialPosition.y = Math.max(MARGIN, initialPosition.y)

const position = reactive(initialPosition)

let isDragging = false
let offset = { x: 0, y: 0 }
let velocity = { x: 0, y: 0 }
let lastTime = 0
let animationFrame: number | null = null

const isLocked = ref(false)

const onMouseDown = (event: MouseEvent) => {
	if (isLocked.value) return
	isDragging = true
	offset.x = event.clientX - position.x
	offset.y = event.clientY - position.y
	velocity = { x: 0, y: 0 } // Reset velocity
	lastTime = performance.now()
	if (animationFrame) cancelAnimationFrame(animationFrame)
	document.addEventListener("mousemove", onMouseMove)
	document.addEventListener("mouseup", onMouseUp)
}

const onMouseMove = (event: MouseEvent) => {
	if (!isDragging) return

	const now = performance.now()
	const deltaTime = now - lastTime
	lastTime = now

	const newX = event.clientX - offset.x
	const newY = event.clientY - offset.y

	velocity.x = (newX - position.x) / deltaTime
	velocity.y = (newY - position.y) / deltaTime

	position.x = newX
	position.y = newY
	updatePosition()
}

const onMouseUp = () => {
	isDragging = false
	document.removeEventListener("mousemove", onMouseMove)
	document.removeEventListener("mouseup", onMouseUp)

	const now = performance.now()
	const deltaTime = now - lastTime
	if (deltaTime < 50) animateRelease()
}

const updatePosition = () => {
	if (!draggable.value) return
	position.x = Math.min(window.innerWidth - draggable.value.offsetWidth - MARGIN, Math.max(MARGIN, position.x))
	position.y = Math.min(window.innerHeight - draggable.value.offsetHeight - MARGIN, Math.max(MARGIN, position.y))
	localStorage.setItem("position", JSON.stringify(position))
	draggable.value.style.left = `${position.x}px`
	draggable.value.style.top = `${position.y}px`
}

const damping = 0.98 // Damping factor to reduce velocity
const threshold = 0.01 // Stop animation when velocity is small
let previousTimestamp: number | null = null

const step = (timestamp: number) => {
	velocity.x *= damping
	velocity.y *= damping

	if (Math.abs(velocity.x) < threshold && Math.abs(velocity.y) < threshold) {
		return // Stop animation when velocity is negligible
	}

	if (previousTimestamp) {
		const interval = timestamp - previousTimestamp

		// Calculate the next position based on velocity
		const nextX = position.x + velocity.x * interval
		const nextY = position.y + velocity.y * interval

		// Check for constraints and apply bounce
		if (nextX < MARGIN || nextX > window.innerWidth - draggable.value!.offsetWidth - MARGIN) {
			velocity.x = -velocity.x * 0.8
		} else {
			position.x = nextX // Update position if not constrained
		}

		if (nextY < MARGIN || nextY > window.innerHeight - draggable.value!.offsetHeight - MARGIN) {
			velocity.y = -velocity.y * 0.8
		} else {
			position.y = nextY // Update position if not constrained
		}

		updatePosition()
	}

	previousTimestamp = timestamp

	animationFrame = requestAnimationFrame(step)
}

const animateRelease = () => {
	previousTimestamp = null
	animationFrame = requestAnimationFrame(step)
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
	window.addEventListener("resize", updatePosition)
	if (animationFrame) cancelAnimationFrame(animationFrame)
})

onUnmounted(() => {
	window.removeEventListener("resize", updatePosition)
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
