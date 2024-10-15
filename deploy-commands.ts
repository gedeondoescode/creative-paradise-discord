import { REST, Routes } from "discord.js";
import { commands } from "./commands";

const commandsData = Object.values(commands).map((command) => command.data);

const rest = new REST({ version: "10" }).setToken(
  process.env.DISCORD_TOKEN as string,
);
export async function deployCommands() {
  try {
    console.log("✨ Started refreshing application (/) commands");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID as string),
      {
        body: commandsData,
      },
    );

    console.log("✨ Finished refreshing application (/) commands.");
  } catch (error) {
    console.error(error);
  }
}
