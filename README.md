# EconomyAPI
EconomyAPI adds the basic features needed to create an economy for a SerenityJS server. This plugin adds in-game commands to interact with a players balance, and as well as an api structure to use the plugin in additional plugins. 

## Command Usage

| Commands | Description | Usage |
|:-----------:|:------------:|:------------:|
| `balance` | Check yours or another player's balance. | `balance [player?: target]` |
| `pay` | Pay another player a specified amount with your balance. | `pay <player: target> <amount: integer>` |
| `update-balance` | Update the balance of a player. (Operator Only) | `update-balance <operation: add, subtract, set> <player: target> <amount: integer>` |

## Plugin Usage
To use the api in your own plugins, you will first need to install the EconomyAPI into your plugins folder and start the server. You'll then notice that a `EconomyAPI.api` folder is generated. Next, run the `npm install economy-api` inside of your plugins directory. You'll then want be able to access the package through your plugin!

```json package.json
"dependencies": {
  "economy-api": "^1.0.0"
}
```

Below is an example usage of using the api in conjunct with another plugin.
```ts
import { PlayerChatSignal, WorldEvent } from "@serenityjs/core";
import { Plugin } from "@serenityjs/plugins";

import EconomyAPI from "economy-api";

export default new Plugin(
	"sample-plugin",
	"1.0.0",
	{
		onInitialize(plugin) {
			// Listen for player chat event
			plugin.serenity.before(WorldEvent.PlayerChat, (event) => {
				// Handle the chat event
				handleChat(event as PlayerChatSignal);

				// Cancel the event
				return false;
			})
		},
	}
)

async function handleChat(event: PlayerChatSignal) {
	// Get the players balance
	const balance = await EconomyAPI.get(event.player);

	// Get the world from the event
	const world = event.world;

	// Send the updated message to the world
	world.sendMessage(
		`§7[§a$${balance}§7]§r ${event.player.username}: ${event.message}`
	)
}
```