import {
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder().setName("ping").setDescription(
  "Replies with server and request latency",
);

export async function execute(interaction: CommandInteraction) {
  const resLatency = Date.now() - interaction.createdTimestamp;

  const serverLatency = interaction.client.ws.ping;

  const pingEmbed = new EmbedBuilder().setColor(0x7289DA).setTitle(
    "Pong! Request Received",
  )
    .addFields(
      { name: "Response Latency", value: `🤖 ${resLatency}ms` },
    ).addFields(
      { name: "Server Latency", value: `🖥️ ${serverLatency}ms` },
    );

  interaction.reply({ embeds: [pingEmbed] });
}
