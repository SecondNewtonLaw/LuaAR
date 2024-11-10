import { BaseDirectory, exists, mkdir, readDir, readFile, remove, writeFile } from "@tauri-apps/plugin-fs"

export interface Review {
	title: string
	created_at: string
	updated_at: string
	url: string
	user_id: string
	review: string
	id?: string
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
	})

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
		}
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
				return JSON.parse(new TextDecoder().decode(data)) as Review
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
			editorsList.map(async (editor) => {
				const data = await readFile(`${editorsPath}/${editor.name}`, dirOptions)
				return new TextDecoder().decode(data)
			})
		)
		return editors.map((editor) => JSON.parse(editor))
	}
	const saveReview = async () => {
		await makeReviewsDir()
		const review = currentReview.value
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
			console.log(editor)
			let editorData = encoder.encode(JSON.stringify(editor))

			await writeFile(`${editorsPath}/${index}.json`, editorData, dirOptions)
		})

		// Reload reviews
		loadReviews()
	}

	const removeReview = async (review: Review) => {
		await makeReviewsDir()
		await remove(`${basePath}/${review.user_id}/${review.id}`, {
			...dirOptions,
			recursive: true,
		})

		// Reload reviews
		loadReviews()
	}

	return {
		currentReview,
		reviews,
		loadReviews,
		loadReview,
		saveReview,
		removeReview,
		newReview,
		getEditorsFromReview,
	}
})