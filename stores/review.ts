import { BaseDirectory, exists, mkdir, readDir, readFile, remove, writeFile } from "@tauri-apps/plugin-fs"

export interface Review {
	title: string
	created_at: string
	updated_at: string
	url: string
	user_id: string
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

	const makeUserDir = async (path: string) => {
		const userFolder = await exists(path, dirOptions)
		if (!userFolder) {
			await mkdir(path, dirOptions)
		}
	}
	const loadReviews = async () => {
		await makeReviewsDir()
		const reviewsList = await readDir(basePath, dirOptions)
		reviews.value = await Promise.all(
			reviewsList.map(async (review) => {
				const data = await readFile(`${basePath}/${review.name}/meta.json`, dirOptions)
				return JSON.parse(new TextDecoder().decode(data)) as Review
			})
		)
	}

	const loadReview = async (review: Review) => {
		//set currentReview, load editors
		currentReview.value = review
		const path = `${basePath}/${review.user_id}`
		const editorsPath = `${path}/editors`
		const editorsList = await readDir(editorsPath, dirOptions)
		const editors = await Promise.all(
			editorsList.map(async (editor) => {
				const data = await readFile(`${editorsPath}/${editor.name}`, dirOptions)
				return new TextDecoder().decode(data)
			})
		)
		editorStore.editors = editors.map((editor) => ({ input: editor, selected: false, collapsed: true }))
	}

	const saveReview = async () => {
		await makeReviewsDir()
		currentReview.value.created_at = new Date().toISOString()
		currentReview.value.updated_at = new Date().toISOString()
		const review = currentReview.value
		const path = `${basePath}/${review.user_id}`
		await makeUserDir(path)

		let encoder = new TextEncoder()
		let data = encoder.encode(JSON.stringify(review))
		await writeFile(`${path}/meta.json`, data, dirOptions)

		// Get active editors from editorStore

		const editors = editorStore.editors
		const editorsPath = `${path}/editors`
		await makeUserDir(editorsPath)

		// Save each editor with their index as a .txt file
		editors.forEach(async (editor, index) => {
			let editorData = encoder.encode(editor.input)
			await writeFile(`${editorsPath}/${index}.txt`, editorData, dirOptions)
		})
	}

	const removeReview = async (review: Review) => {
		await makeReviewsDir()
		await makeUserDir(`${basePath}/${review.user_id}`)
		await remove(`${basePath}/${review.user_id}`, dirOptions)
	}

	return {
		currentReview,
		reviews,
		loadReviews,
		loadReview,
		saveReview,
		removeReview,
		newReview,
	}
})
