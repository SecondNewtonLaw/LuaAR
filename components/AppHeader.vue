<template>
	<header>
		<v-toolbar flat color="transparent">
			<v-toolbar-title class="text-h6 font-weight-bold"> Lua Application Reader Copilot </v-toolbar-title>
			<v-spacer></v-spacer>
			<v-toolbar-items>
				<v-btn icon :to="{ name: 'index' }">
					<v-icon>mdi-home</v-icon>
				</v-btn>
				<v-btn icon :to="{ name: 'reviews' }">
					<v-icon>mdi-comment-text-outline</v-icon>
				</v-btn>
			</v-toolbar-items>
		</v-toolbar>
	</header>
</template>

<script lang="ts" setup></script>

<style scoped></style>
