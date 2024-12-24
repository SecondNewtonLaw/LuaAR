<template>
	<div>
		<v-row dense>
			<v-col cols="12" sm="4">
				<v-combobox
					v-model="selectedRoles"
					single-line
					multiple
					density="compact"
					hide-details
					variant="solo-filled"
					:items="roles"
					label="Filter by Role"
					clearable />
			</v-col>
			<v-col cols="12" sm="4">
				<v-combobox
					v-model="selectedSkills"
					multiple
					single-line
					density="compact"
					hide-details
					variant="solo-filled"
					:items="settingsStore.skills"
					label="Filter by Skill"
					clearable />
			</v-col>
			<v-col cols="12" sm="4">
				<v-combobox
					density="compact"
					single-line
					hide-details
					variant="solo-filled"
					v-model="selectedUser"
					:items="users"
					label="Filter by User"
					clearable></v-combobox>
			</v-col>
			<v-col>
				<v-btn @click="showSkills = !showSkills" color="primary" prepend-icon="mdi-filter">
					{{ showSkills ? "Show by Readers" : "Show by Skills" }}
				</v-btn>
			</v-col>
		</v-row>

		<v-data-table
			:sort-by="sortBy"
			:headers="showSkills ? skillHeaders : headers"
			:items="showSkills ? filteredSkills : filteredReaders">
			<template #item.skills="{ item }">
				<v-chip-group column>
					<v-chip
						v-if="'skills' in item"
						v-for="skill in item.skills"
						:key="skill"
						class="mr-2 font-weight-bold"
						variant="tonal"
						@click="selectedSkills = [skill]"
						:style="{ backgroundColor: `${colors.get(skill)}` }"
						style="filter: brightness(0.9)"
						>{{ skill }}</v-chip
					>
				</v-chip-group>
			</template>
			<template #item.readers="{ item }">
				<v-chip-group>
					<v-chip v-if="'readers' in item" v-for="reader in item.readers" :key="reader" class="mr-2">{{
						reader
					}}</v-chip>
				</v-chip-group>
			</template>
		</v-data-table>
	</div>
</template>

<script lang="ts" setup>
export interface Reader {
	user_id: number
	skills: Skill[]
	role: "AR" | "SAR" | "Management" | "Head"
	name: string
	timezone: string
}

const settingsStore = useSettingsStore()
const readers = ref<Reader[]>([
	{
		user_id: 623238907772796961,
		skills: ["Lua", "Voice Actor", "Video Editor", "JavaScript"],
		name: "LifeDigger",
		timezone: "",
		role: "SAR",
	},
	{
		user_id: 326078015727599616,
		skills: ["Lua", "Python", "JavaScript"],
		name: "Scriptone",
		timezone: "Europe/Brussels",
		role: "AR",
	},
	{
		user_id: 1010290469235871785,
		skills: ["Lua", "C#", "C++"],
		name: "Dottik",
		timezone: "America/Barbados",
		role: "AR",
	},
	{
		user_id: 650283793374249011,
		skills: ["Lua", "HTML/CSS", "JavaScript"],
		name: "Ashlyn",
		timezone: "",
		role: "AR",
	},
	{
		user_id: 302058196896579584,
		skills: ["Lua"],
		name: "Optimized",
		timezone: "Asia/Kolkata",
		role: "SAR",
	},
	{
		user_id: 1143575748427382848,
		skills: ["3D Modeler", "Graphics Artist"],
		name: "Akio",
		timezone: "",
		role: "AR",
	},
	{
		user_id: 999018383817326723,
		skills: ["Graphics Artist"],
		name: "Austin",
		timezone: "",
		role: "SAR",
	},
	{
		user_id: 661556544466583553,
		skills: ["Interface Designer"],
		name: "Bordoma",
		role: "AR",
		timezone: "",
	},
	{
		user_id: 269724942180941824,
		skills: [
			"Lua",
			"Interface Designer",
			"Texture Artist",
			"Music Composer",
			"3D Modeler",
			"Clothing",
			"Graphics Artist",
			"Animator",
		],
		role: "AR",
		name: "daisy",
		timezone: "",
	},
	{
		user_id: 381337534556274689,
		skills: ["Builder"],
		name: "souleth",
		timezone: "",
		role: "AR",
	},
	{
		user_id: 879313965790920764,
		skills: ["Builder", "Terrain Editor", "Interface Designer"],
		name: "Parra",
		timezone: "America/Belize",
		role: "SAR",
	},
	{
		user_id: 552477847751753739,
		skills: ["Builder", "Interface Designer", "Clothing", "Graphics Artist"],
		name: "Lettuce",
		timezone: "",
		role: "AR",
	},
	{
		user_id: 352387677149986818,
		skills: [
			"Builder",
			"Terrain Editor",
			"Interface Designer",
			"Voice Actor",
			"Sound Effects",
			"HTML/CSS",
			"Python",

			"Music Composer",
			"3D Modeler",
			"Video Editor",
			"Graphics Artist",
			"Texture Artist",
			"Visual Effects",
		],
		name: "Aero",
		timezone: "Asia/Kolkata",
		role: "Head",
	},
	{
		user_id: 524139654719471616,
		skills: ["Builder", "3D Modeler"],
		name: "Gator",
		timezone: "",
		role: "AR",
	},
	{
		user_id: 886355963894988801,
		skills: ["Interface Designer", "Graphics Artist"],
		name: "jonahxo",
		timezone: "America/Los_Angeles",
		role: "Management",
	},
	{
		user_id: 488164549027954708,
		skills: ["3D Modeler", "Animator"],
		name: "Shehatesaddy",
		timezone: "",
		role: "AR",
	},
	{
		user_id: 610544677904449673,
		skills: ["3D Modeler", "Clothing", "Graphics Artist"],
		name: "Romaxino",
		timezone: "",
		role: "AR",
	},
	{
		user_id: 766558323084230697,
		skills: ["Clothing"],
		name: "Dan",
		timezone: "",
		role: "AR",
	},
	{
		user_id: 118496586299998209,
		skills: ["Java"],
		name: "Solo",
		timezone: "",
		role: "AR",
	},
	{
		user_id: 222804393030844438,
		skills: ["PHP"],
		name: "Volvic",
		timezone: "",
		role: "AR",
	},
	{
		user_id: 533903312551149588,
		skills: ["Voice Actor", "Graphics Artist"],
		name: "a1exmechanic101",
		timezone: "",
		role: "AR",
	},
])

const showSkills = ref(false)

const roles = ref<string[]>(["AR", "SAR", "Management", "Head"])
const users = ref<string[]>(readers.value.map((reader) => reader.name))
const selectedRoles = ref<string[]>([])
const selectedSkills = ref<Skill[]>([])
const selectedUser = ref<string | null>(null)
const sortBy = ref([{ key: "role", order: "desc" as const }])

//color per skill
const colors = new Map<Skill, string>()
colors.set("Lua", "#26C620")
colors.set("C#", "#26C620")
colors.set("C++", "#26C620")
colors.set("Python", "#26C620")
colors.set("Java", "#26C620")
colors.set("PHP", "#26C620")
colors.set("JavaScript", "#26C620")
colors.set("HTML/CSS", "#26C620")
colors.set("Voice Actor", "#A57BF7")
colors.set("Video Editor", "#F35167")
colors.set("Graphics Artist", "#65B9B2")
colors.set("Interface Designer", "#65B9B2")
colors.set("Texture Artist", "#65B9B2")
colors.set("Music Composer", "#A57BF7")
colors.set("3D Modeler", "#27B3EE")
colors.set("Animator", "#21BD74")
colors.set("Clothing", "#CBCA49")
colors.set("Builder", "#80A7FF")
colors.set("Terrain Editor", "#BED048")
colors.set("Sound Effects", "#A57BF7")
colors.set("Visual Effects", "#65B9B2")

const headers = [
	{ title: "Name", key: "name" },
	//sort should be by index of the role in the roles array
	{ title: "Role", key: "role", sort: (a: string, b: string) => roles.value.indexOf(a) - roles.value.indexOf(b) },
	{ title: "Skills", key: "skills" },
	// { title: "Timezone", key: "timezone" },
	// {
	// 	title: "Time",
	// 	key: "_",
	// 	value: (item: Reader) => {
	// 		try {
	// 			return new Date().toLocaleTimeString("en-US", { timeZone: item.timezone })
	// 		} catch {
	// 			return "Invalid timezone"
	// 		}
	// 	},
	// },
]

const skillHeaders = [
	{ title: "Skill", key: "skill" },
	{ title: "Readers", key: "readers" },
]

const filteredReaders = computed(() => {
	return readers.value.filter((reader) => {
		const matchesRole = selectedRoles.value.length ? selectedRoles.value.includes(reader.role) : true
		const matchesSkill = selectedSkills.value.length
			? selectedSkills.value.some((skill) => reader.skills.includes(skill))
			: true
		const matchesUser = selectedUser.value ? reader.name === selectedUser.value : true
		return matchesRole && matchesUser && matchesSkill
	})
})

const filteredSkills = computed(() => {
	const skillsMap: Record<string, string[]> = {}

	readers.value.forEach((reader) => {
		reader.skills.forEach((skill) => {
			if (!skillsMap[skill]) {
				skillsMap[skill] = []
			}
			skillsMap[skill].push(reader.name)
		})
	})

	return Object.entries(skillsMap).map(([skill, readers]) => ({ skill, readers }))
})
</script>
