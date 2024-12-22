<template>
	<div>
		<v-card title="Alt moderation" flat>
			<v-form class="pa-4">
				<v-row>
					<v-col sm="12" lg="6" v-for="(user, userIndex) in users" :key="userIndex">
						<v-card flat border>
							<v-card-title class="d-flex justify-space-between">
								User {{ userIndex + 1 }}
								<v-btn icon color="error" density="compact" @click="removeUser(userIndex)">
									<v-icon>mdi-delete-outline</v-icon>
								</v-btn>
							</v-card-title>
							<v-card-text>
								<v-text-field
									variant="solo"
									single-line
									v-model="user.notes"
									label="Notes for User"
									dense>
								</v-text-field>

								<v-row v-for="(uid, uidIndex) in user.userids" :key="uidIndex">
									<v-col cols="4">
										<v-text-field
											variant="solo"
											single-line
											v-model="uid.userid"
											label="User ID"
											density="compact">
										</v-text-field>
									</v-col>
									<v-col cols="2">
										<v-select
											variant="solo"
											single-line
											v-model="uid.role"
											:items="['main', 'alt']"
											label="Role"
											density="compact">
										</v-select>
									</v-col>
									<v-col cols="full">
										<v-text-field
											variant="solo"
											single-line
											density="compact"
											v-model="uid.notes"
											label="Notes for User ID"
											dense>
										</v-text-field>
									</v-col>
									<v-col cols="auto">
										<v-btn
											icon
											density="compact"
											class="my-1"
											@click="removeUserId(userIndex, uidIndex)">
											<v-icon>mdi-delete-outline</v-icon>
										</v-btn>
									</v-col>
								</v-row>

								<v-btn single-line color="secondary" density="compact" @click="addUserId(userIndex)">
									<v-icon>mdi-plus</v-icon>
									Add User ID
								</v-btn>
							</v-card-text>
						</v-card>
					</v-col>
				</v-row>
				<v-btn-group divided rounded class="ga-2 my-4">
					<v-btn prepend-icon="mdi-plus" single-line color="primary" density="compact" @click="addUser">
						Add user
					</v-btn>
					<v-btn prepend-icon="mdi-import" color="info" density="compact" @click="showImport = true">
						Import Text
					</v-btn>
				</v-btn-group>
				<v-dialog v-model="showImport" max-width="600px">
					<v-card>
						<v-card-title>Import Users from Text</v-card-title>
						<v-card-text>
							<v-textarea v-model="importText" label="Paste your text here"></v-textarea>
						</v-card-text>
						<v-card-actions>
							<v-btn color="primary" @click="importUsers">Import</v-btn>
							<v-btn variant="text" @click="showImport = false">Cancel</v-btn>
						</v-card-actions>
					</v-card>
				</v-dialog>
			</v-form>
			<v-divider class="mb-4"></v-divider>
			<v-card>
				<v-card-title class="d-flex justify-space-between">
					Text Output
					<v-btn icon @click="copyToClipboard">
						<v-icon>mdi-content-copy</v-icon>
					</v-btn>
				</v-card-title>
				<v-card-text>
					<pre>{{ textOutput }}</pre>
				</v-card-text>
			</v-card>
		</v-card>
	</div>
</template>

<script lang="ts" setup>
import { toast } from "vuetify-sonner";

interface UserId {
	userid: string
	role: string
	notes: string
}

interface User {
	userids: UserId[]
	notes: string
}

const users = ref<User[]>([
	{
		userids: [{ userid: "", role: "main", notes: "" }],
		notes: "",
	},
])

const showImport = ref(false)
const importText = ref("")

const addUser = () => users.value.push({ userids: [{ userid: "", role: "main", notes: "" }], notes: "" })

const removeUser = (index: number) => users.value.splice(index, 1)

const addUserId = (userIndex: number) => users.value[userIndex].userids.push({ userid: "", role: "alt", notes: "" })

const removeUserId = (userIndex: number, uidIndex: number) => users.value[userIndex].userids.splice(uidIndex, 1)

const textOutput = computed(() =>
	users.value
		.map((user, i) => {
			const main = user.userids.find((uid) => uid.role === "main")
			const alts = user.userids.filter((uid) => uid.role === "alt")
			return `#${i + 1} ${user.notes}\nmain: ${
				main ? `${main.userid} <@${main.userid}> ${main.notes}` : "none"
			}\nalts: ${
				alts.length ? alts.map((uid) => `\n- ${uid.userid} <@${uid.userid}> ${uid.notes}`).join("") : "none"
			}`
		})
		.join("\n")
)

const copyToClipboard = () => {
	navigator.clipboard.writeText(textOutput.value)
	toast.success("Copied to clipboard")
}

// Method to import users from pasted text
const importUsers = () => {
	const lines = importText.value.split("\n")
	let currentUser: User | null = null

	lines.forEach((line) => {
		line = line.trim()
		if (line.startsWith("#")) {
			if (currentUser) {
				users.value.push(currentUser)
			}
			const notes = line.substring(line.indexOf(" ") + 1)
			currentUser = { userids: [], notes }
		} else if (line.startsWith("main:")) {
			const parts = line.substring(5).trim().split(" ")
			if (currentUser) {
				currentUser.userids.push({
					userid: parts[0],
					role: "main",
					notes: parts.slice(2).join(" "),
				})
			}
		} else if (line.startsWith("-")) {
			const parts = line.substring(1).trim().split(" ")
			if (currentUser) {
				currentUser.userids.push({
					userid: parts[0],
					role: "alt",
					notes: parts.slice(2).join(" "),
				})
			}
		}
	})

	if (currentUser) {
		users.value.push(currentUser)
	}

	showImport.value = false
	importText.value = ""
	toast.success("Users imported successfully")
}
</script>

<style></style>
