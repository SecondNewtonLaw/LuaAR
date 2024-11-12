import { BaseDirectory, exists, mkdir, readDir, readFile, remove, writeFile } from "@tauri-apps/plugin-fs"
import { toast } from "vuetify-sonner"

export interface Review {
	title: string
	created_at: string
	updated_at: string
	url: string
	user_id: string
	review: string
	id?: string
	evidence: string[]
}
export const useReviewStore = defineStore("reviews", () => {
	const reviews = ref<Review[]>()
	const editorStore = useEditorStore()
	const currentReview = ref<Review>({
		title: "",
		created_at: "",
		updated_at: "",
		url: "",
		user_id: "",
		review: "",
		evidence: [],
	})

	const evidence = ref<File[]>([])

	const basePath = "reviews"
	const dirOptions = {
		baseDir: BaseDirectory.AppData,
	}

	const newReview = () => {
		currentReview.value = {
			title: "",
			created_at: "",
			updated_at: "",
			url: "",
			review: "",
			user_id: "",
			evidence: [],
		}
		evidence.value = []
		editorStore.resetEditors()
	}
	const makeReviewsDir = async () => {
		const reviewsFolder = await exists(basePath, dirOptions)
		if (!reviewsFolder) {
			await mkdir(basePath, {
				...dirOptions,
				recursive: true,
			})
		}
	}

	const makeReviewDir = async (path: string) => {
		const userFolder = await exists(path, dirOptions)
		if (!userFolder) {
			await mkdir(path, {
				...dirOptions,
				recursive: true,
			})
		}
	}
	const loadReviews = async () => {
		await makeReviewsDir()
		const reviewList = await readDir(basePath, dirOptions)
		const allReviews = await Promise.all(
			reviewList.map(async (review) => {
				const data = await readFile(`${basePath}/${review.name}/meta.json`, dirOptions)
				const reviewData = JSON.parse(new TextDecoder().decode(data)) as Review
				return reviewData
			})
		)
		reviews.value = allReviews.flat()
	}

	const loadReview = async (id?: string) => {
		//set currentReview, load editors
		if (!id) return
		const review = reviews.value?.find((review) => review.id === id)
		if (!review || !review.id) return
		currentReview.value = review

		editorStore.editors = await getEditorsFromReview(review.id)
	}

	const getEditorsFromReview = async (review_id: string) => {
		const path = `${basePath}/${review_id}`
		const editorsPath = `${path}/editors`
		const editorsList = await readDir(editorsPath, dirOptions)
		const editors = await Promise.all(
			editorsList.map(async (editorFile) => {
				const data = await readFile(`${editorsPath}/${editorFile.name}`, dirOptions)
				return JSON.parse(new TextDecoder().decode(data)) as Editor
			})
		)
		return editors
	}
	const saveReview = async () => {
		await makeReviewsDir()
		const review = currentReview.value
		const update = !!review.id
		if (!review.id) {
			review.id = crypto.randomUUID()
			review.created_at = new Date().toISOString()
		}
		review.updated_at = new Date().toISOString()
		const path = `${basePath}/${review.id}`
		await makeReviewDir(path)

		let encoder = new TextEncoder()
		let data = encoder.encode(JSON.stringify(review))
		await writeFile(`${path}/meta.json`, data, dirOptions)

		// Get active editors from editorStore

		const editors = editorStore.editors
		const editorsPath = `${path}/editors`
		await makeReviewDir(editorsPath)

		// Save each editor with their index as a .txt file
		editors.forEach(async (editor, index) => {
			let editorData = encoder.encode(JSON.stringify(editor))

			await writeFile(`${editorsPath}/${index}.json`, editorData, dirOptions)
		})

		toast.success(`Review ${update ? "updated" : "created"}`)
		// Reload reviews
		loadReviews()
	}

	const removeReview = async (id: string) => {
		await makeReviewsDir()
		await remove(`${basePath}/${id}`, {
			...dirOptions,
			recursive: true,
		})

		toast.info("Review removed")
		// Reload reviews
		loadReviews()
	}

	watchEffect(async () => {
		//change evidence files to base64
		const files = evidence.value
		//use readAsDataURL to convert files to base64
		const promises = files.map((file) => {
			return new Promise((resolve, reject) => {
				const reader = new FileReader()
				reader.onload = () => {
					resolve(reader.result)
				}
				reader.onerror = reject
				reader.readAsDataURL(file)
			})
		})
		const base64Files = await Promise.all(promises)
		currentReview.value.evidence = base64Files as string[]
	})
	return {
		currentReview,
		evidence,
		reviews,
		loadReviews,
		loadReview,
		saveReview,
		removeReview,
		newReview,
		getEditorsFromReview,
	}
})
