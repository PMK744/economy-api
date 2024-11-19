import { resolve } from "node:path";

import { Plugin, PluginType } from "@serenityjs/plugins";
import { Database } from "sqlite3";
import { Player, PlayerJoinSignal, WorldEvent } from "@serenityjs/core";

import { EconomyCommands } from "./commands";

class EconomyAPI extends Plugin {
	public readonly type = PluginType.Api;

	/**
	 * The database connection for the economy plugin.
	*/
	public readonly database: Database;

	/**
	 * Whether or not the database connection is attached.
	*/
	protected attached = false

	/**
	 * The default balance players start with.
	*/
	public defaultBalance = 0;

	public constructor() {
		super("EconomyAPI", "1.0.0");

		// Create the database connection.
		this.database = new Database(resolve(process.cwd(), "economy.db"), (error) => {
			// Check if there was an error opening the database connection.
			if (error) this.logger.error("Failed to open database connection.", error);

			// Set the attached flag to true if there was no error.
			else this.attached = true;
		});
	}

	public onInitialize(): void {
		// Check if the table exists in the database.
		this.database.get("SELECT name FROM sqlite_master WHERE type='table' AND name='economy'", (error, row) => {
			// Check if there was an error checking if the table exists.
			if (error) this.logger.error("Failed to check if table exists.", error);

			// Check if the table does not exist.
			else if (!row) {
				// Create the table in the database.
				this.database.run("CREATE TABLE economy (username TEXT PRIMARY KEY, balance INTEGER)", (error) => {
					// Check if there was an error creating the table.
					if (error) this.logger.error("Failed to create table.", error);

					// Log that the table was created successfully.
					else this.logger.debug("Table created successfully.");
				});
			}
		});

		// Register the commands.
		this.serenity.on(WorldEvent.WorldInitialize, ({ world }) => {
			// Register the economy commands
			for (const register of EconomyCommands) register(world, this);
		});

		// Hook the world events.
		this.serenity.on(WorldEvent.PlayerJoin, this.onPlayerJoined.bind(this));
	}

	public onStartUp(): void {
		// Log that the economy plugin has started.
		this.logger.info("Plugin has started successfully.");
	}

	public onShutDown(): void {
		// Close the database connection.
		this.database.close((error) => {
			// Check if there was an error closing the database connection.
			if (error) this.logger.error("Failed to close database connection.", error);

			// Set the attached flag to false if there was no error.
			else this.attached = false;
		});

		// Log that the economy plugin has stopped.
		this.logger.info("Plugin has stopped successfully.");
	}

	/**
	 * Checks if the database has the player.
	 * @param player The player to check.
	 * @returns Whether or not the player is in the database.
	 */
	public has(player: Player | string): boolean {
		// Get the username of the player.
		const username = typeof player === "string" ? player : player.username;

		// Check if the database connection is not attached.
		if (!this.attached) return false;

		// Check if the player is in the database.
		this.database.get("SELECT * FROM economy WHERE username = ?", [username], (error, row) => {
			// Check if there was an error checking if the player is in the database.
			if (error) this.logger.error("Failed to check if player exists.", error);

			// Check if the player is not in the database.
			else if (!row) return false;
		});

		// Return true if the player is in the database.
		return true;
	}

	/**
	 * Gets the balance of the player.
	 * @param player The player to get the balance of.
	 * @returns The balance of the player.
	 */
	public async get(player: Player | string): Promise<number> {
		return new Promise((resolve) => {
			// Get the username of the player.
			const username = typeof player === "string" ? player : player.username;

			// Check if the database connection is not attached.
			if (!this.attached) return resolve(0);

			// Get the balance of the player.
			this.database.get<{ balance: number }>("SELECT balance FROM economy WHERE username = ?", [username], (error, row) => {
				// Check if there was an error getting the balance of the player.
				if (error) this.logger.error("Failed to get player balance.", error);

				// Check if the player is not in the database.
				else if (!row) return resolve(0);

				// Set the balance variable to the balance of the player.
				else return resolve(row.balance);
			});
		});
	}

	/**
	 * Sets the balance of the player.
	 * @param player The player to set the balance of.
	 * @param balance The balance to set.
	 */
	public set(player: Player | string, balance: number): void {
		// Get the username of the player.
		const username = typeof player === "string" ? player : player.username;

		// Check if the database connection is not attached.
		if (!this.attached) return;

		// Set the balance of the player.
		this.database.run("UPDATE economy SET balance = ? WHERE username = ?", [balance, username], (error) => {
			// Check if there was an error setting the balance of the player.
			if (error) this.logger.error("Failed to set player balance.", error);
		});
	}

	protected onPlayerJoined(event: PlayerJoinSignal): void {
		// Check if the database connection is not attached.
		if (!this.attached) return;

		// Check if the player is not in the database.
		this.database.get("SELECT * FROM economy WHERE username = ?", [event.player.username], (error, row) => {
			// Check if there was an error checking if the player is in the database.
			if (error) this.logger.error("Failed to check if player exists.", error);

			// Check if the player is not in the database.
			else if (!row) {
				// Add the player to the database.
				this.database.run("INSERT INTO economy (username, balance) VALUES (?, ?)", [event.player.username, this.defaultBalance], (error) => {
					// Check if there was an error adding the player to the database.
					if (error) this.logger.error("Failed to add player to database.", error);

					// Log that the player was added to the database successfully.
					else this.logger.debug(`Player "${event.player.username}" was added to database.`);
				});
			}
		});
	}
}

export { EconomyAPI };

export default new EconomyAPI();