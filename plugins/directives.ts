export default defineNuxtPlugin((nuxtApp) => {
	console.log("directives.ts")
	nuxtApp.vueApp.directive("auto-focus", {
		mounted(el: HTMLElement) {
			console.log("auto-focus")
			el.focus()
		},
	})
})
