export default defineNuxtConfig({
	// (optional) Enable the Nuxt devtools
	devtools: { enabled: true },

	// Enable SSG
	ssr: false,

	// Enables the development server to be discoverable by other devices when running on iOS physical devices
	devServer: { host: process.env.TAURI_DEV_HOST || "localhost" },

	components: [
		{
			path: "~/components", // will get any components nested in let's say /components/test too
			pathPrefix: false,
		},
	],

	vite: {
		// Better support for Tauri CLI output
		clearScreen: false,
		// Enable environment variables
		// Additional environment variables can be found at
		// https://v2.tauri.app/reference/environment-variables/
		envPrefix: ["VITE_", "TAURI_"],
		server: {
			// Tauri requires a consistent port
			strictPort: true,
		},
		css: {
			preprocessorOptions: {
				scss: {
					api: "modern-compiler", // or "modern"
				},
			},
		},
	},

	css: ["highlight.js/styles/github.css", "@/assets/style.scss"],
	modules: ["vuetify-nuxt-module", "@nuxt/fonts"],

	vuetify: {
		moduleOptions: {
			/* module specific options */
		},
		vuetifyOptions: {
			/* vuetify options */
			theme: {
				defaultTheme: "dark",
				themes: {
					light: {
						dark: false,
						colors: {
							primary: "#00BCD4",
						},
					},
				},
			},
		},
	},
})