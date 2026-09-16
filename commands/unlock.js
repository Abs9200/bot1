await interaction.channel.permissionOverwrites.edit(
 interaction.guild.roles.everyone,
 { SendMessages:null }
);