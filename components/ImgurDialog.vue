<template>
	<v-dialog v-model="showImgurUpload" persistent max-width="500px">
		<v-card>
			<v-card-title>Upload to Imgur</v-card-title>
			<v-card-text>
				Upload the images to Imgur to get the links to embed in the review.

				<v-divider class="my-4"></v-divider>
				<v-textarea
					v-model="description"
					label="Description"
					hint="Optional description for the images"
					hide-details
					clearable
					auto-grow
					single-line
					dense
					variant="outlined"></v-textarea>
			</v-card-text>
			<v-card-actions>
				<v-btn color="error" @click="showImgurUpload = false">Cancel</v-btn>
				<v-btn color="primary" :loading="uploading" @click="upload">Upload</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script lang="ts" setup>
import { toast } from "vuetify-sonner"

interface ImgurResponse {
	status: number
	success: boolean
	data: {
		id: string
		deletehash: string
		account_id: number | null
		account_url: string | null
		ad_type: number | null
		ad_url: string | null
		title: string | null
		description: string | null
		name: string
		type: string
		width: number
		height: number
		size: number
		views: number
		section: string | null
		vote: string | null
		bandwidth: number
		animated: boolean
		favorite: boolean
		in_gallery: boolean
		in_most_viral: boolean
		has_sound: boolean
		is_ad: boolean
		nsfw: boolean | null
		link: string
		tags: any[]
		datetime: number
		mp4: string
		hls: string
	}
}

const showImgurUpload = defineModel<boolean>()

const config = useRuntimeConfig()
const reviewStore = useReviewStore()
const description = ref("")
const uploading = ref(false)
const upload = async () => {
	try {
		uploading.value = true

		const links = await Promise.all(
			reviewStore.currentReview.evidence.map(async (evidence) => {
				//evidence is a base64 string, convert it into suitable format for formdata
				const blob = await fetch(evidence).then((res) => res.blob())
				const formData = new FormData()
				formData.append("image", blob)
				formData.append("type", "image")
				formData.append(
					"title",
					`HD Application: ${reviewStore.currentReview.title ?? "N/A"} - ${
						reviewStore.currentReview.user_id ?? "N/A"
					}`
				)
				formData.append("description", description.value)

				const response = await $fetch<ImgurResponse>("https://api.imgur.com/3/image", {
					method: "POST",

					headers: {
						Authorization: `Client-ID ${config.public.imgurClientId}`,
					},
					body: formData,
					referrer: "",
					referrerPolicy: "no-referrer",
				})
				if (!response.success) {
					throw new Error(`${response.status}: Failed to upload to Imgur`)
				}

				return response.data.link
			})
		)
		reviewStore.currentReview.review ??= ""
		reviewStore.currentReview.review += `\nGenerated IMGUR links\n${links.join("\n")}`

		toast.success(`Uploaded ${links.length} image${links.length > 1 ? "s" : ""} to Imgur`)
	} catch (error) {
		console.log("Failed to upload images to Imgur", error)
		toast.error("Failed to upload images to Imgur")
	} finally {
		showImgurUpload.value = false
		uploading.value = false
	}
}
</script>

<style></style>
