const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("renew")
    .setDescription("Recrée le salon actuel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction){

    const channel = interaction.channel;

    await interaction.reply("🔄 Renouvellement du salon...");

    const clone = await channel.clone();

    await clone.setPosition(channel.position);

    await channel.delete();

    clone.send("✅ Salon renouvelé.");
  }
};