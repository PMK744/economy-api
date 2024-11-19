import { Entity, Player, TargetEnum, World } from "@serenityjs/core";
import { EconomyAPI } from "..";

function register(world: World, plugin: EconomyAPI) {
  world.commands.register(
    "balance",
    "Check yours or another player's balance.",
    (registry) => {
      // Overload for passing a player target.
      registry.overload(
        {
          player: [TargetEnum, true] // Target is optional.
        },
        (async ({ player, origin }) => {
          // Check if a target was passed.
          if (!player.result) {
            // Check if the player is not a player.
            if (!(origin instanceof Player))
              throw new Error("You must be a player to check your balance.");

            // Get the player's balance.
            const balance = await plugin.get(origin)

            // Return the balance.
            return {
              message: `§7Your current balance is §a$${balance}.§r`,
              target: origin.username, // Allow the target to be accessed from command execution. 
              balance // Allow the balance to be accessed from command execution.
            }
          } else {
            // Check if a target was passed.
            if (player.result.length === 0)
              throw new Error("No target matched the specified selector.");

            // Check if the is only one target.
            if (player.result.length !== 1)
              throw new Error("You can only check one player's balance at a time.");

            // Get the target player.
            const target = player.result[0] as Entity;

            // Check if the target is not a player.
            if (!target.isPlayer())
              throw new Error("The specified target is not a player.");

            // Get the target's balance.
            const balance = await plugin.get(target);
            
            // Return the balance.
            return {
              message: `§u${target.username}'s§7 current balance is §a$${balance}.§r`,
              target: target.username, // Allow the target to be accessed from command execution. 
              balance // Allow the balance to be accessed from command execution.
            }
          }
        })
      );

    },
    () => { throw new Error("No overload matched argument.") },
  )
}

export default register;