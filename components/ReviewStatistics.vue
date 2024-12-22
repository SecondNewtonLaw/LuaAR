<template>
	<v-card class="mb-4">
		<v-card-title> Review Statistics </v-card-title>
		<v-card-subtitle
			>From: {{ startDate?.toLocaleDateString() }} To: {{ endDate?.toLocaleDateString() }}
		</v-card-subtitle>
		<v-row class="align-start ma-2">
			<v-col>
				<DatePickerComponent v-model="startDate" label="Start Date" />
			</v-col>
			<v-col>
				<DatePickerComponent v-model="endDate" label="End Date" />
			</v-col>
			<v-col>
				<v-select
					density="comfortable"
					multiple
					hide-details
					variant="solo-filled"
					prepend-inner-icon="mdi-account-group"
					v-model="selectedRoles"
					:items="settingsStore.roles"
					label="Roles"></v-select>
			</v-col>
		</v-row>
		<v-card-text class="d-flex ga-2">
			<v-chip color="success">{{ approvalRatio }}% Approved</v-chip>
			<v-chip color="error">{{ deniedRatio }}% Denied</v-chip>
			<v-chip color="warning">{{ totalMutes }} Muted</v-chip>
		</v-card-text>

		<v-row>
			<v-col>
				<StatisticCard
					title="Total Reviews"
					:total="totalReviews"
					color="primary"
					:series="totalReviewsSeries"
					:labels="labels" />
			</v-col>
			<v-col>
				<StatisticCard
					title="Approved Reviews"
					:total="approvedReviews"
					:labels="labels"
					color="success"
					:series="approvedReviewsSeries"
			/></v-col>
			<v-col>
				<StatisticCard
					title="Denied Reviews"
					:total="deniedReviews"
					color="error"
					:series="deniedReviewsSeries"
					:labels="labels"
			/></v-col>
			<v-col
				><StatisticCard
					title="Muted Reviews"
					:total="mutedReviews"
					color="warning"
					:series="mutedReviewsSeries"
					:labels="labels"
			/></v-col>
		</v-row>
		<apexchart class="pa-5" height="300px" :options="chartOptions" :series="chartSeries"></apexchart>
	</v-card>
</template>

<script lang="ts" setup>
const settingsStore = useSettingsStore()
const selectedRoles = ref<Role[]>([settingsStore.defaultRole])
const props = defineProps<{
	reviews?: Review[]
}>()

const startDate = computed({
	get: () => new Date(settingsStore.startDate),
	set: (date: Date) => (settingsStore.startDate = date.toISOString()),
})
const endDate = computed({
	get: () => new Date(settingsStore.endDate),
	set: (date: Date) => (settingsStore.endDate = date.toISOString()),
})

const filteredReviews = computed(() => {
	if (!props.reviews) return []
	return props.reviews.filter((review) => {
		if (!selectedRoles.value.includes(review.role)) return false
		const reviewDate = new Date(review.created_at)
		return (!startDate.value || reviewDate >= startDate.value) && (!endDate.value || reviewDate <= endDate.value)
	})
})

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
	return Array.from(counts.entries())
		.map(([date, count]) => ({ x: date, y: count }))
		.sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime())
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
	const start = startDate.value
	const end = endDate.value
	const totalDays = Math.ceil((end.getTime() - start.getTime()) / MILLISECONDS_IN_A_DAY) + 1

	const uniqueDates = Array.from({ length: totalDays }, (_, index) => {
		const currentDate = new Date(start.getTime() + index * MILLISECONDS_IN_A_DAY)
		return currentDate.toLocaleDateString()
	})

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
