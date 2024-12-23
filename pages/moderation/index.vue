<template>
	<div>
		<v-row>
			<v-col cols="12">
				<VExpansionPanels :model-value="[1, 2]" multiple>
					<VExpansionPanel eager>
						<v-expansion-panel-title>Alt Moderation</v-expansion-panel-title>
						<v-expansion-panel-text>
							<AltModeration />
						</v-expansion-panel-text>
					</VExpansionPanel>
					<VExpansionPanel eager>
						<v-expansion-panel-title>Users</v-expansion-panel-title>
						<v-expansion-panel-text>
							<UserList />
						</v-expansion-panel-text>
					</VExpansionPanel>
					<VExpansionPanel eager>
						<v-expansion-panel-title>Application Readers</v-expansion-panel-title>
						<v-expansion-panel-text>
							<ARList />
						</v-expansion-panel-text>
					</VExpansionPanel>
				</VExpansionPanels>
			</v-col>
		</v-row>
	</div>
</template>

<script lang="ts" setup></script>

<style scoped></style>
