const member = interaction.options.getMember("membre");
const reason = interaction.options.getString("raison") || "Aucune raison.";

await member.ban({ reason });