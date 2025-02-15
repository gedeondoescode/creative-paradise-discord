import "dotenv/config";

import {
  Client,
  CommandInteraction,
  Events,
  GatewayIntentBits,
  type Interaction,
} from "discord.js";
import { deployCommands } from "./deploy-commands";
import { commands } from "./commands";

export const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once(Events.ClientReady, async (c) => {
  await deployCommands();
  console.log(`${c.user.tag} is ready!`);
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  const commandInteraction = interaction as CommandInteraction;

  const { commandName } = commandInteraction;
  if (commands[commandName as keyof typeof commands]) {
    commands[commandName as keyof typeof commands].execute(commandInteraction);
  }
});

client.login(process.env.DISCORD_TOKEN);
