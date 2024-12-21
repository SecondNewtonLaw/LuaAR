export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.directive("auto-focus", {
		mounted(el: HTMLElement) {
			el.focus()

			//check if element contains a input element
			const input = el.querySelector("input") || el.querySelector("textarea")
			if (input) {
				input.focus()
			}
		},
	})
})
