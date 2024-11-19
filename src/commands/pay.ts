import { Entity, IntegerEnum, Player, TargetEnum, World } from "@serenityjs/core";
import { EconomyAPI } from "..";

function register(world: World, plugin: EconomyAPI) {
  world.commands.register(
    "pay",
    "Pay another player a specified amount.",
    (registry) => {
      // Overload for passing a player target.
      registry.overload(
        {
          player: TargetEnum,
          amount: IntegerEnum
        },
        (async (context) => {
          // Check if the player is not a player.
          if (!(context.origin instanceof Player))
            throw new Error("You must be a player to pay another player.");

          // Get the targets and amount.
          const targets = context.player.result as Entity[];
          const amount = Math.floor(context.amount.result as number); // Round the amount to the nearest whole number.

          // Check if a target was passed.
          if (targets.length === 0)
            throw new Error("No target matched the specified selector.");

          // Check if the is only one target.
          if (targets.length !== 1)
            throw new Error("You can only pay one player at a time.");

          // Get the target player.
          const target = targets[0] as Player;

          // Check if the target is not a player.
          if (!target.isPlayer())
            throw new Error("The specified target is not a player.");

          // Check if the player is the target.
          if (context.origin === target)
            throw new Error("You cannot pay yourself.");
        
          // Check if the amount provided is less than or equal to zero.
          if (amount <= 0)
            throw new Error("You must provide a positive amount to pay another player.");

          // Get the player's balance.
          const balance = await plugin.get(context.origin);

          // Check if the player has enough money.
          if (balance < amount)
            throw new Error("You do not have the sufficient funds to pay another player.");

          // Get the target's balance.
          const targetBalance = await plugin.get(target);

          // Update the player's balance.
          await plugin.set(context.origin, balance - amount);

          // Update the target's balance.
          await plugin.set(target, targetBalance + amount);

          // Send a message to the target.
          target.sendMessage(`§u${context.origin.username} §7has paid you §a$${amount}.§r`);

          // Return the balance.
          return {
            message: `§7You have paid §a$${amount} §7to §u${target.username}.§r`,
            source: context.origin.username, // Allow the source to be accessed from command execution
            sourceBalance: balance - amount, // Allow the source balance to be accessed from command execution
            target: target.username, // Allow the target to be accessed from command execution
            targetBalance: targetBalance + amount, // Allow the target balance to be accessed from command execution
          }
        })
      );

    },
    () => { throw new Error("No overload matched argument.") },
  )
}

export default register;