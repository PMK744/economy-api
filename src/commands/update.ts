import { Entity, IntegerEnum, Player, TargetEnum, World } from "@serenityjs/core";
import { EconomyAPI } from "..";
import { UpdateBalanceOperationEnum } from "./enum";

function register(world: World, plugin: EconomyAPI) {
  world.commands.register(
    "update-balance",
    "Update the balance of a player.",
    (registry) => {
      // Set the permission level to operator.
      registry.permissionLevel = 1;
      registry.debug = true;

      // Overload for passing a player target.
      registry.overload(
        {
          operation: UpdateBalanceOperationEnum,
          player: TargetEnum,
          amount: IntegerEnum
        },
        (async (context) => {
          // Get the operation, target, and amount.
          const operation = context.operation.result as string;
          const targets = context.player.result as Entity[];
          const amount = Math.floor(context.amount.result as number); // Round the amount to the nearest whole number.

          // Check if a target was passed.
          if (targets.length === 0)
            throw new Error("No target matched the specified selector.");

          // Filter the targets to only include players.
          const players = targets.filter((target) => target.isPlayer()) as Player[];

          // Iterate over the players.
          for (const player of players) {
            // Get the player's balance.
            let balance = await plugin.get(player);

            // Update the player's balance.
            switch (operation) {
              case "add":
                balance += amount;
                break;
              case "subtract":
                balance -= amount;
                break;
              case "set":
                balance = amount;
                break;
            }

            // Set the player's balance.
            await plugin.set(player, balance);
          }

          // Return the message.
          return {
            message: `§7Updated §u${players.length} player(s)§7 balance by §a$${amount}§7.`
          }
        })
      );

    },
    () => { throw new Error("No overload matched argument.") },
  )
}

export default register;