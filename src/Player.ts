import findExec from "find-exec"
import { type ChildProcess, spawn } from "node:child_process"

import { OS_PLAYERS_CLI_NAMES } from "./constants.ts"

export class Player {
	#osPlayerProcess: ChildProcess | null = null
	#osPlayerCliName: string | null

	constructor() {
		this.#osPlayerCliName = findExec(OS_PLAYERS_CLI_NAMES)

		console.log(this.#osPlayerCliName)
	}

	play(url: string): Promise<void> {
		return new Promise((resolve, reject) => {
			if (!this.#osPlayerCliName) {
				reject(new Error("Couldn't find a suitable audio player"))

				return
			}

			this.#osPlayerProcess = spawn(this.#osPlayerCliName, [url])
			if (!process) {
				reject(
					new Error(`Unable to spawn process with ${this.#osPlayerCliName}`),
				)

				return
			}

			process.on("close", (err) => {
				if (err) {
					reject(err)

					return
				}

				resolve()
			})
		})
	}

	stop() {
		if (this.#osPlayerProcess && !this.#osPlayerProcess.killed) {
			this.#osPlayerProcess.kill()
			this.#osPlayerProcess = null
		}
	}
}
