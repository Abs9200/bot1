const {
 SlashCommandBuilder,
 PermissionFlagsBits
} = require("discord.js");

module.exports = {
 data: new SlashCommandBuilder()
 .setName("add")
 .setDescription("Ajoute un membre au salon.")
 .addUserOption(option =>
 option.setName("membre").setDescription("Utilisateur").setRequired(true))
 .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

 async execute(interaction){

 const user = interaction.options.getMember("membre");

 await interaction.channel.permissionOverwrites.edit(user,{
 ViewChannel:true,
 SendMessages:true
 });

 interaction.reply(`✅ ${user} ajouté au salon.`);
 }
}