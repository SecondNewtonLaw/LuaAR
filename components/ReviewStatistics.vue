<template>
	<v-card class="mb-4" flat>
		<v-card-subtitle class="pa-0 mb-2"
			>From: {{ settingsStore.startDate?.toLocaleDateString() }} To:
			{{ settingsStore.endDate?.toLocaleDateString() }}
		</v-card-subtitle>

		<v-card-text class="pa-0">
			<v-row class="ga-2 my-1">
				<v-col cols="auto" class="pa-0 ml-3">
					<v-chip color="success">{{ approvalRatio }}% Approved</v-chip>
				</v-col>
				<v-col cols="auto" class="pa-0">
					<v-chip color="error">{{ deniedRatio }}% Denied</v-chip>
				</v-col>
				<v-col cols="auto" class="pa-0">
					<v-chip color="warning">{{ totalMutes }} Muted</v-chip>
				</v-col>
			</v-row>

			<v-row class="pa-0 ma-0 mt-4">
				<v-col class="pa-0">
					<StatisticCard
						title="Total Reviews"
						:total="totalReviews"
						color="primary"
						:series="totalReviewsSeries"
						:labels="labels" />
				</v-col>
				<v-col class="pa-0">
					<StatisticCard
						title="Approved Reviews"
						:total="approvedReviews"
						:labels="labels"
						color="success"
						:series="approvedReviewsSeries"
				/></v-col>
				<v-col class="pa-0">
					<StatisticCard
						title="Denied Reviews"
						:total="deniedReviews"
						color="error"
						:series="deniedReviewsSeries"
						:labels="labels"
				/></v-col>
				<v-col class="pa-0"
					><StatisticCard
						title="Muted Reviews"
						:total="mutedReviews"
						color="warning"
						:series="mutedReviewsSeries"
						:labels="labels"
				/></v-col>
				<v-col cols="12" class="pa-0 mt-4">
					<apexchart height="300px" :options="chartOptions" :series="chartSeries"></apexchart>
				</v-col>
			</v-row>
		</v-card-text>
	</v-card>
</template>

<script lang="ts" setup>
const settingsStore = useSettingsStore()

const props = defineProps<{
	reviews?: Review[]
}>()

const filteredReviews = computed(() => props.reviews || [])

const getCountsPerDay = (predecate: (review: Review) => boolean) => {
	if (!filteredReviews.value) return []
	const counts = new Map<string, number>()
	filteredReviews.value.forEach((review) => {
		const reviewDate = new Date(review.created_at)
		const date = reviewDate.toLocaleDateString()
		if (predecate(review)) {
			counts.set(date, (counts.get(date) || 0) + 1)
		} else {
			counts.set(date, counts.get(date) || 0)
		}
	})
	return quickSort(
		Array.from(counts.entries()).map(([date, count]) => ({ x: date, y: count })),
		(a, b) => new Date(a.x).getTime() - new Date(b.x).getTime()
	)
}

const approvalsPerDay = computed(() => getCountsPerDay((r) => !!r.approved))
const denialsPerDay = computed(() => getCountsPerDay((r) => !r.approved))

const getRatio = (approved: boolean) =>
	filteredReviews.value.length
		? (
				(filteredReviews.value.filter((r) => !!r.approved === approved).length / filteredReviews.value.length) *
				100
		  ).toFixed(2)
		: "0"

const approvalRatio = computed(() => getRatio(true))
const deniedRatio = computed(() => getRatio(false))
const totalMutes = computed(() => filteredReviews.value.filter((r) => r.muted).length)
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
	xaxis: { categories: [] },
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
	const MILLISECONDS_IN_A_DAY = 86400000
	const start = settingsStore.startDate
	const end = settingsStore.endDate
	const totalDays = Math.ceil((end.getTime() - start.getTime()) / MILLISECONDS_IN_A_DAY) + 1

	const uniqueDates = Array.from({ length: totalDays }, (_, index) =>
		new Date(start.getTime() + index * MILLISECONDS_IN_A_DAY).toLocaleDateString()
	)

	return Array.from(new Set(uniqueDates))
})

// DD/MM
const labels = computed(() => dates.value.map((date) => date.slice(4, 10)))

const createSeries = (predicate: (review: Review) => boolean) =>
	computed(() =>
		dates.value.map(
			(date) =>
				filteredReviews.value?.filter(
					(r) => predicate(r) && new Date(r.created_at).toLocaleDateString() === date
				).length || 0
		)
	)

const totalReviewsSeries = createSeries(() => true)
const approvedReviewsSeries = createSeries((r) => r.approved)
const deniedReviewsSeries = createSeries((r) => !r.approved)
const mutedReviewsSeries = createSeries((r) => r.muted)

const totalReviews = computed(() => totalReviewsSeries.value.reduce((a, b) => a + b, 0))
const approvedReviews = computed(() => approvedReviewsSeries.value.reduce((a, b) => a + b, 0))
const deniedReviews = computed(() => deniedReviewsSeries.value.reduce((a, b) => a + b, 0))
const mutedReviews = computed(() => mutedReviewsSeries.value.reduce((a, b) => a + b, 0))
</script>

<style scoped lang="scss"></style>
