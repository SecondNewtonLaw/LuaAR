export default defineNuxtPlugin((nuxtApp) => {
	console.log("directives.ts")
	nuxtApp.vueApp.directive("auto-focus", {
		mounted(el: HTMLElement) {
			console.log("auto-focus")
			el.focus()

			//check if element contains a input element
			const input = el.querySelector("input") || el.querySelector("textarea")
			if (input) {
				input.focus()
			}
		},
	})
})
