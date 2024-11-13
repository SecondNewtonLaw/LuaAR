export const useScrape = () => {
	const scrape = async (url: string) => {
		console.log("scrape", url)
		// const browser = await puppeteer.launch({
		// 	executablePath: "/usr/bin/google-chrome-stable",
		// 	headless: true,
		// 	args: ["--no-sandbox"],
		// })
		// console.log("browser", browser)
		// const page = await browser.newPage()
		// await page.goto(url, { waitUntil: "networkidle2" })

		// const result = await page.evaluate(() => {
		// 	const title = document.querySelector("h1")?.textContent
		// 	const description = document.querySelector("p")?.textContent
		// 	return { title, description }
		// })

		// await browser.close()
		// return result
	}

	return { scrape }
}
