import {
  ActionRowBuilder,
  ButtonBuilder,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  ModalBuilder,
  PermissionsBitField,
  SlashCommandBuilder,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { GuildConfigTable } from "../db/schema";
import { db } from "../db";
import { client } from "../index";

export const data = new SlashCommandBuilder()
  .setName("channelsetup")
  .setDescription("Set up the proper channels for job requests")
  .addChannelOption((option) =>
    option
      .setName("queue")
      .setDescription("Where new job requests are sent for review")
      .setRequired(true)
  )
  .addChannelOption((option) =>
    option
      .setName("request")
      .setDescription("Where users can create a request")
      .setRequired(true)
  )
  .addChannelOption((option) =>
    option
      .setName("job-board")
      .setDescription("Where approved job requests are publicly available")
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator);

const modal = new ModalBuilder()
  .setCustomId("jobRulesModal")
  .setTitle("Set Job Guildelnes");

// const titleInput = new TextInputBuilder()
//   .setCustomId("jobRulesTitle")
//   .setLabel("Set a title")
//   .setStyle(TextInputStyle.Short)
//   .setRequired(false);

const rulesInput = new TextInputBuilder()
  .setCustomId("jobRulesGuidelines")
  .setLabel("Define the guidelines for new posts")
  .setStyle(TextInputStyle.Paragraph)
  .setRequired(true);

// const titleActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
//   titleInput
// );
const guidelinesActionRow =
  new ActionRowBuilder<TextInputBuilder>().addComponents(rulesInput);

modal.addComponents(guidelinesActionRow);

export async function execute(interaction: CommandInteraction) {
  if (!interaction.member) {
    await interaction.reply({
      content: "You must be an administrator to use this command!",
      ephemeral: true,
    });
    return;
  }
  if (
    !interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)
  ) {
    await interaction.reply({
      content: "You must be an administrator to use this command!",
      ephemeral: true,
    });
  }

  const queueChannel = interaction.options.get("queue");
  const requestChannel = interaction.options.get("request");
  const boardChannel = interaction.options.get("job-board");

  if (
    !interaction.guildId ||
    !queueChannel?.value ||
    !requestChannel?.value ||
    !boardChannel?.value
  ) {
    await interaction.reply({
      content: "Please provide the proper channel for all fields!",
    });
  }

  const inferGuildConfig: typeof GuildConfigTable.$inferInsert = {
    guildId: interaction.guildId,
    queueChannel: `${queueChannel?.value}`,
    requestChannel: `${requestChannel?.value}`,
    boardChannel: `${boardChannel?.value}`,
  };

  await db
    .insert(GuildConfigTable)
    .values(inferGuildConfig)
    .onConflictDoUpdate({
      target: GuildConfigTable.guildId,
      set: {
        queueChannel: `${queueChannel?.value}`,
        requestChannel: `${requestChannel?.value}`,
        boardChannel: `${boardChannel?.value}`,
      },
    });

  await interaction.showModal(modal);

  const modalResponse = interaction.awaitModalSubmit({
    filter: (i) => i.customId === "jobRulesModal",
    time: 1_000_000,
  });

  if ((await modalResponse).isModalSubmit()) {
    const description = (await modalResponse).fields.getTextInputValue(
      "jobRulesGuidelines"
    );

    const embed = new EmbedBuilder()
      .setColor(0x5539cc)
      .setTitle("Job Post Guidelines")
      .setDescription(`${description}`);

    const modalButton = new ButtonBuilder()
      .setCustomId("jobPostModalBtn")
      .setLabel("Get Started");

    const buttonActionRow = new ActionRowBuilder().addComponents(modalButton);

    const embedMsgChannel = await client.channels.fetch(
      `${requestChannel?.value}`
    );

    (await modalResponse).reply({
      content: `You've assigned the following channels for the specified responsiblity: Queue: <#${queueChannel?.value}>, Requests: <#${requestChannel?.value}>, and Job Board: <#${boardChannel?.value}>.`,
      ephemeral: true,
    });

    if (embedMsgChannel instanceof TextChannel) {
      await embedMsgChannel.send({
        embeds: [embed],
      });
    }
  }
}
