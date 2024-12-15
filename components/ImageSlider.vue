<template>
	<div v-if="length > 0">
		<div class="images-wrapper scroll-container">
			<div v-for="(base64, index) in images" :key="base64" class="image-container">
				<img :src="base64" @click="openDialog(index)" class="clickable-image" />
				<v-btn icon="mdi-delete" @click="deleteImage(index)" color="error" class="delete-image-button" />
			</div>
		</div>
		<v-dialog v-model="dialog" max-width="500">
			<v-card>
				<v-card-title class="d-flex justify-end align-center">
					{{ selectedIndex + 1 }} / {{ length }}
					<v-spacer />
					<v-btn icon @click="copyImage" class="copy-title-button">
						<v-icon>mdi-content-copy</v-icon>
					</v-btn>
					<v-btn
						icon="mdi-delete"
						@click="deleteImage(selectedIndex)"
						color="error"
						class="delete-dialog-button" />
					<v-btn icon @click="dialog = false">
						<v-icon>mdi-close</v-icon>
					</v-btn>
				</v-card-title>
				<v-card-text class="dialog-content">
					<v-img :src="images[selectedIndex]" width="auto" height="auto"></v-img>
					<v-btn icon @click="prevImage" class="prev-button">
						<v-icon>mdi-chevron-left</v-icon>
					</v-btn>
					<v-btn icon @click="nextImage" class="next-button">
						<v-icon>mdi-chevron-right</v-icon>
					</v-btn>
				</v-card-text>
			</v-card>
		</v-dialog>
	</div>
</template>

<script lang="ts" setup>
import { toast } from "vuetify-sonner"

const images = defineModel<string[]>()

const dialog = ref(false)
const selectedIndex = ref(0)

const length = computed(() => images.value?.length || 0)

const openDialog = (index: number) => {
	selectedIndex.value = index
	dialog.value = true
}

const prevImage = () => {
	selectedIndex.value = selectedIndex.value > 0 ? selectedIndex.value - 1 : length.value - 1
}

const nextImage = () => {
	selectedIndex.value = selectedIndex.value < length.value - 1 ? selectedIndex.value + 1 : 0
}

const copyImage = async () => {
	if (!images.value) return

	try {
		const response = await fetch(images.value[selectedIndex.value])
		const blob = await response.blob()
		await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
		toast.success("Image copied to clipboard")
	} catch (error) {
		toast.error("Failed to copy image to clipboard")
	}
}

const deleteImage = (index: number) => {
	images.value?.splice(index, 1)
	toast.success("Image deleted")
}
</script>

<style scoped lang="scss">
.scroll-container {
	overflow: auto;
}

.images-wrapper {
	display: flex;
	align-items: flex-start;
	flex-wrap: nowrap;
	gap: 0.5rem;
	overflow-x: auto; // Enable horizontal scrolling
}

.image-container {
	position: relative;
	flex-shrink: 0; // Prevent images from shrinking
	max-width: max(50%, 20rem);
}

img {
	height: 200px;
	width: auto;

	object-fit: contain;
}

.dialog-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	position: relative;
}

.prev-button,
.next-button {
	position: absolute;
	top: 50%;
	transform: translateY(-50%);
}

.prev-button {
	left: 10px; // Adjusted for better positioning
}

.next-button {
	right: 10px; // Adjusted for better positioning
}

.clickable-image {
	cursor: pointer;
}

.navigation-buttons {
	display: flex;
	justify-content: space-between;
	width: 100%;
	margin-top: 10px;
}

.copy-title-button {
	margin-right: 8px; // Adjust spacing as needed
}

.delete-image-button {
	position: absolute;
	top: 5px;
	right: 5px;
	background: rgba(255, 255, 255, 0.7);
}

.delete-dialog-button {
	margin-right: 8px;
}
</style>
