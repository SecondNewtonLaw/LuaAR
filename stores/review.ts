import { BaseDirectory, exists, mkdir, readDir, readFile, remove, writeFile } from "@tauri-apps/plugin-fs"
import { toast } from "vuetify-sonner"

export interface Review {
	title: string | null
	created_at: string
	updated_at: string
	url: string | null
	user_id: string | null
	review: string | null
	id?: string
	evidence: string[]
}
export const useReviewStore = defineStore("reviews", () => {
	const reviews = ref<Review[]>()
	const editorStore = useEditorStore()
	const currentReview = ref<Review>({
		title: null,
		created_at: "",
		updated_at: "",
		url: null,
		user_id: null,
		review: null,
		evidence: [],
	})

	let oldReview = JSON.stringify(currentReview.value)

	const evidence = ref<File[]>([])

	const chosenPath = ref<string | null>(
		localStorage.getItem("chosenPath") ? localStorage.getItem("chosenPath") : null
	)
	watch(chosenPath, (path) => {
		if (path) {
			localStorage.setItem("chosenPath", path)
		} else {
			localStorage.removeItem("chosenPath")
		}
	})
	const basePath = computed(() => chosenPath.value ?? "reviews")
	const dirOptions = computed(() =>
		chosenPath.value
			? undefined
			: {
					baseDir: BaseDirectory.AppData,
			  }
	)

	const isTouched = ref(false)
	const silent = ref(false)
	watch(
		currentReview,
		() => {
			if (silent.value) return
			const newReview = currentReview.value
			isTouched.value = JSON.stringify(newReview) !== oldReview
		},
		{ deep: true }
	)

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
		oldReview = JSON.stringify(currentReview.value)
		evidence.value = []
		editorStore.resetEditors()
	}
	const makeReviewsDir = async () => {
		const reviewsFolder = await exists(basePath.value, dirOptions.value)
		if (!reviewsFolder) {
			await mkdir(basePath.value, {
				...dirOptions.value,
				recursive: true,
			})
		}
	}

	const makeReviewDir = async (path: string) => {
		const userFolder = await exists(path, dirOptions.value)
		if (!userFolder) {
			await mkdir(path, {
				...dirOptions.value,
				recursive: true,
			})
		}
	}
	const loadReviews = async () => {
		try {
			await makeReviewsDir()
			const reviewList = await readDir(basePath.value, dirOptions.value)
			const allReviews = await Promise.all(
				reviewList.map(async (review) => {
					const data = await readFile(`${basePath.value}/${review.name}/meta.json`, dirOptions.value)
					const reviewData = JSON.parse(new TextDecoder().decode(data)) as Review
					return reviewData
				})
			)
			reviews.value = allReviews.flat()
		} catch (error) {
			toast.error("Failed to load reviews")
			console.log(error)
		}
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
		try {
			const path = `${basePath.value}/${review_id}`
			const editorsPath = `${path}/editors`
			const editorsList = await readDir(editorsPath, dirOptions.value)
			const editors = await Promise.all(
				editorsList.map(async (editorFile) => {
					const data = await readFile(`${editorsPath}/${editorFile.name}`, dirOptions.value)
					return JSON.parse(new TextDecoder().decode(data)) as Editor
				})
			)
			return editors
		} catch (error) {
			toast.error("Failed to load editors")
			console.log(error)
			return []
		}
	}
	const saveReview = async () => {
		if (!isTouched.value) return toast.info("No changes to save")
		await makeReviewsDir()
		silent.value = true
		const review = currentReview.value
		const update = !!review.id
		if (!review.id) {
			review.id = crypto.randomUUID()
			review.created_at = new Date().toISOString()
		}
		review.updated_at = new Date().toISOString()
		const path = `${basePath.value}/${review.id}`
		await makeReviewDir(path)

		let encoder = new TextEncoder()
		let data = encoder.encode(JSON.stringify(review))
		try {
			await writeFile(`${path}/meta.json`, data, { ...dirOptions.value })
		} catch (error) {
			toast.error("Failed to save review metadata")
			console.log(error)
		}

		// Get active editors from editorStore

		const editors = editorStore.editors
		const editorsPath = `${path}/editors`
		await makeReviewDir(editorsPath)

		try {
			const saveEditorsPromises = editors.map(async (editor, index) => {
				let editorData = encoder.encode(JSON.stringify(editor))
				await writeFile(`${editorsPath}/${index}.json`, editorData, dirOptions.value)
			})
			await Promise.all(saveEditorsPromises)
		} catch (error) {
			toast.error("Failed to save editors")
			console.log(error)
		}

		toast.success(`Review ${update ? "updated" : "created"}`)
		oldReview = JSON.stringify(currentReview.value)
		isTouched.value = false
		silent.value = false
		loadReviews()
	}

	const removeReview = async (id: string) => {
		try {
			await makeReviewsDir()
			await remove(`${basePath.value}/${id}`, {
				...dirOptions.value,
				recursive: true,
			})
			toast.info("Review removed")
		} catch (error) {
			toast.error("Failed to remove review")
			console.log(error)
		}
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

	watch(basePath, () => {
		loadReviews()
	})

	return {
		currentReview,
		isTouched,
		evidence,
		reviews,
		chosenPath,
		loadReviews,
		loadReview,
		saveReview,
		removeReview,
		newReview,
		getEditorsFromReview,
	}
})
