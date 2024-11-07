<template>
	<div>
		<textarea v-model="input" rows="10" cols="50"></textarea>
		<CodeViewVue :content="input" />
	</div>
</template>

<script lang="ts" setup>
const input = ref(
	'# markdown-it rulezz! \n\n ```html \n <pre><code class="js">function test();</code></pre>\n```'
)
</script>

<style></style>
