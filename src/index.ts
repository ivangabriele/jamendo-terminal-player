import axios from "axios"
import { B } from "bhala"
import download from "download"
import { uniq } from "ramda"

import "dotenv/config"

import { Player } from "./Player.ts"
import { ONE_HOUR_IN_MS, ONE_QUARTER_IN_MS } from "./constants.ts"

class App {
	#player: Player
	#playlistCursor = 0
	#playlistUrls: string[] = []

	constructor() {
		this.#player = new Player()

		this.#start()
	}

	async #start() {
		await this.#updatePlaylistUrls()

		while (this.#shouldPlay()) {
			const nextUrl = this.#playlistUrls[this.#playlistCursor]

			try {
				await this.#player.play(nextUrl)
			} catch (err) {
				B.error(`[Jamendo Terminal Player] Error playing track: ${err}`)

				await this.waitFor(ONE_QUARTER_IN_MS)

				continue
			}

			if (this.#playlistCursor === this.#playlistUrls.length - 1) {
				this.#playlistCursor = 0
			}
		}

		this.#player.stop()

		while (!this.#shouldPlay()) {
			await this.waitFor(ONE_HOUR_IN_MS)
		}

		this.#start()
	}

	#shouldPlay() {
		const currentHour = new Date().getHours()

		return currentHour >= 6 && currentHour < 24
	}

	async #updatePlaylistUrls() {
		try {
			const response = await axios.get("https://api.jamendo.com/v3.0/tracks", {
				params: {
					// biome-ignore lint/style/useNamingConvention: <explanation>
					client_id: process.env.JAMENDO_API_CLIENT_ID,
					format: "json",
					limit: 200,
					order: "popularity_week",
				},
			})

			const newPlaylistUrls: string[] = response.data.results.map(
				(track) => track.audio,
			)
			const nextPlaylistUrls = uniq([...this.#playlistUrls, ...newPlaylistUrls])

			this.#playlistUrls = nextPlaylistUrls
		} catch (err) {
			B.error(`[Jamendo Terminal Player] Error fetching Jamendo tracks: ${err}`)

			await this.waitFor(ONE_QUARTER_IN_MS)

			await this.#updatePlaylistUrls()
		}
	}

	async waitFor(ms: number) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms)
		})
	}
}

const response = await axios.get("https://api.jamendo.com/v3.0/tracks", {
	params: {
		// biome-ignore lint/style/useNamingConvention: <explanation>
		client_id: process.env.JAMENDO_API_CLIENT_ID,
		format: "json",
		limit: 200,
		order: "popularity_week",
	},
})

const downloadUrls = response.data.results.map((track) => track.audiodownload)

for (const downloadUrl of downloadUrls) {
	B.info(`Downloading ${downloadUrl}...`)
	try {
		await download(downloadUrl, "./data")
	} catch (err) {
		B.error(`Error downloading ${downloadUrl}: ${err}`)
	}
}
