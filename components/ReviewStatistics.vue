<template>
	<v-card title="Analytics" class="mb-4">
		<div class="date-picker-container" style="display: flex; gap: 16px">
			<DatePickerComponent v-model="startDate" label="Start Date" />
			<DatePickerComponent v-model="endDate" label="End Date" />
		</div>
		<v-card-text>
			<v-chip color="success" class="mr-2">{{ approvalRatio }}% Approved</v-chip>
			<v-chip color="error">{{ deniedRatio }}% Denied</v-chip>
		</v-card-text>

		<v-row class="mt-4">
			<ReviewCard
				title="Total Reviews"
				:total="totalReviews"
				color="primary"
				:series="totalReviewsSeries"
				:labels="labels" />
			<ReviewCard
				title="Approved Reviews"
				:total="approvedReviews"
				:labels="labels"
				color="success"
				:series="approvedReviewsSeries" />
			<ReviewCard
				title="Denied Reviews"
				:total="deniedReviews"
				color="error"
				:series="deniedReviewsSeries"
				:labels="labels" />
		</v-row>
		<apexchart height="300px" :options="chartOptions" :series="chartSeries"></apexchart>
	</v-card>
</template>

<script lang="ts" setup>
import DatePickerComponent from "./DatePickerComponent.vue"
import ReviewCard from "./ReviewCard.vue"

const props = defineProps<{
	reviews?: Review[]
}>()

const today = new Date()
const currentDay = today.getDate()
const startHalf = currentDay <= 15 ? 1 : 16
const startDate = ref<Date | null>(new Date(today.getFullYear(), today.getMonth(), startHalf))
const endDate = ref<Date | null>(new Date(today.getFullYear(), today.getMonth() + 1, startHalf === 1 ? 15 : 0))

const getCountsPerDay = (approved: boolean) => {
	if (!props.reviews) return []
	const counts = new Map<string, number>()
	props.reviews.forEach((review) => {
		const reviewDate = new Date(review.created_at)
		if (startDate.value && reviewDate < new Date(startDate.value)) return
		if (endDate.value && reviewDate > new Date(endDate.value)) return
		if (!!review.approved === approved) {
			const date = reviewDate.toDateString()
			counts.set(date, (counts.get(date) || 0) + 1)
		}
	})
	return Array.from(counts.entries())
		.map(([date, count]) => ({ x: date, y: count }))
		.sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime())
}

const approvalsPerDay = computed(() => getCountsPerDay(true))
const denialsPerDay = computed(() => getCountsPerDay(false))

// Add a computed property for filtered reviews
const filteredReviews = computed(() => {
	if (!props.reviews) return []
	return props.reviews.filter((review) => {
		const reviewDate = new Date(review.created_at)
		return (!startDate.value || reviewDate >= startDate.value) && (!endDate.value || reviewDate <= endDate.value)
	})
})

// Modify getRatio to use filteredReviews
const getRatio = (approved: boolean) =>
	filteredReviews.value.length
		? (
				(filteredReviews.value.filter((r) => !!r.approved === approved).length / filteredReviews.value.length) *
				100
		  ).toFixed(2)
		: "0"

const approvalRatio = computed(() => getRatio(true))
const deniedRatio = computed(() => getRatio(false))

const chartOptions = computed(() => ({
	chart: {
		id: "area",
		type: "area",
		toolbar: {
			show: false,
		},
	},
	theme: {
		mode: "dark",
		palette: "palette1",
		monochrome: {
			enabled: false,
			shadeTo: "dark",
			shadeIntensity: 0.5,
		},
	},
	xaxis: { categories: [new Date().toLocaleDateString()] },
}))

const chartSeries = computed(() => [
	{
		name: "Approvals",
		data: approvalsPerDay.value,
	},
	{
		name: "Denials",
		data: denialsPerDay.value,
	},
])

const dates = computed(() => {
	const daysDiff = Math.ceil((endDate.value!.getTime() - startDate.value!.getTime()) / 86400000) + 1
	return Array.from({ length: daysDiff }, (_, i) => {
		const date = new Date(startDate.value!.getTime() + i * 86400000)
		return date.toDateString()
	})
})

// DD/MM
const labels = computed(() => dates.value.map((date) => date.slice(4, 10)))

const createSeries = (predicate: (review: Review) => boolean) =>
	computed(() =>
		dates.value.map(
			(date) =>
				props.reviews?.filter((r) => predicate(r) && new Date(r.created_at).toDateString() === date).length || 0
		)
	)

const totalReviewsSeries = createSeries(() => true)
const approvedReviewsSeries = createSeries((r) => r.approved)
const deniedReviewsSeries = createSeries((r) => !r.approved)

const totalReviews = computed(() => totalReviewsSeries.value.reduce((a, b) => a + b, 0))
const approvedReviews = computed(() => approvedReviewsSeries.value.reduce((a, b) => a + b, 0))
const deniedReviews = computed(() => deniedReviewsSeries.value.reduce((a, b) => a + b, 0))
</script>

<style scoped lang="scss"></style>
