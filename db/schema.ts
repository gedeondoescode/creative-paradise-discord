import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const GuildConfigTable = sqliteTable("guild_config", {
  id: int().primaryKey({ autoIncrement: true }),
  guildId: text().unique(),
  queueChannel: text(),
  requestChannel: text(),
  boardChannel: text(),
});
