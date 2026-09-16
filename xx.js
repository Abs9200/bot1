require("dotenv").config();
const config = require("./config.json");

const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  PermissionsBitField,
  ChannelType,
  EmbedBuilder
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ]
});
const blacklist = new Set();

// ================= STATUTS ROTATIFS =================

const statuts = [
  {
    type: 1, // Streaming
    name: "shu's Bot",
    url: "https://twitch.tv/discord"
  },
  {
    type: 0, // Joue à
    name: "+4 protected servers"
  },
  {
    type: 3, // Regarde
    name: "z_z"
  },
  {
    type: 2, // Écoute
    name: "xx"
  },
  {
    type: 0, // Joue à
    name: "dm for bot/help"
  }
];

let statutIndex = 0;

/* ================= COMMANDES SLASH ================= */

const commands = [

  // MODÉRATION
  new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Supprimer des messages.")
    .addIntegerOption(o =>
      o.setName("nombre")
        .setDescription("1 à 100 messages")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("renew")
    .setDescription("Recréer le salon actuel."),

  new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Verrouiller le salon."),

  new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Déverrouiller le salon."),

  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bannir un membre.")
    .addUserOption(o =>
      o.setName("membre").setDescription("Membre").setRequired(true)
    )
    .addStringOption(o =>
      o.setName("raison").setDescription("Raison")
    ),

  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Expulser un membre.")
    .addUserOption(o =>
      o.setName("membre").setDescription("Membre").setRequired(true)
    )
    .addStringOption(o =>
      o.setName("raison").setDescription("Raison")
    ),

  new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout un membre.")
    .addUserOption(o =>
      o.setName("membre").setDescription("Membre").setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName("minutes").setDescription("Durée").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("giverole")
    .setDescription("Donner un rôle.")
    .addUserOption(o =>
      o.setName("membre").setDescription("Membre").setRequired(true)
    )
    .addRoleOption(o =>
      o.setName("role").setDescription("Rôle").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("removerole")
    .setDescription("Retirer un rôle.")
    .addUserOption(o =>
      o.setName("membre").setDescription("Membre").setRequired(true)
    )
    .addRoleOption(o =>
      o.setName("role").setDescription("Rôle").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Mettre un slowmode.")
    .addIntegerOption(o =>
      o.setName("secondes").setDescription("Secondes").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("nick")
    .setDescription("Changer le pseudo.")
    .addUserOption(o =>
      o.setName("membre").setDescription("Membre").setRequired(true)
    )
    .addStringOption(o =>
      o.setName("pseudo").setDescription("Pseudo").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("add")
    .setDescription("Ajouter un membre au salon.")
    .addUserOption(o =>
      o.setName("membre").setDescription("Membre").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Retirer un membre du salon.")
    .addUserOption(o =>
      o.setName("membre").setDescription("Membre").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("hide")
    .setDescription("Cacher le salon."),

  new SlashCommandBuilder()
    .setName("unhide")
    .setDescription("Afficher le salon."),

  new SlashCommandBuilder()
    .setName("raidunlock")
    .setDescription("Déverrouiller tous les salons."),

  // UTILITAIRES

  new SlashCommandBuilder()
    .setName("say")
    .setDescription("Le bot parle.")
    .addStringOption(o =>
      o.setName("message").setDescription("Texte").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Créer un embed.")
    .addStringOption(o =>
      o.setName("titre").setDescription("Titre").setRequired(true)
    )
    .addStringOption(o =>
      o.setName("description").setDescription("Description").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Créer une annonce.")
    .addStringOption(o =>
      o.setName("message").setDescription("Annonce").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Créer un sondage.")
    .addStringOption(o =>
      o.setName("question").setDescription("Question").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Voir un avatar.")
    .addUserOption(o =>
      o.setName("membre").setDescription("Membre")
    ),

  new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Infos d'un membre.")
    .addUserOption(o =>
      o.setName("membre").setDescription("Membre")
    ),

  new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Infos du serveur."),

  new SlashCommandBuilder()
    .setName("membercount")
    .setDescription("Nombre de membres."),

  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Voir le ping."),

  // SALONS

  new SlashCommandBuilder()
    .setName("voicecreate")
    .setDescription("Créer un vocal.")
    .addStringOption(o =>
      o.setName("nom").setDescription("Nom").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("textcreate")
    .setDescription("Créer un salon texte.")
    .addStringOption(o =>
      o.setName("nom").setDescription("Nom").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("rename")
    .setDescription("Renommer le salon.")
    .addStringOption(o =>
      o.setName("nom").setDescription("Nom").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("deletechannel")
    .setDescription("Supprimer le salon."),

  // TICKETS

  new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Créer un ticket."),

  new SlashCommandBuilder()
    .setName("close")
    .setDescription("Fermer un ticket."),

  // FUN

  new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Pile ou face."),

  new SlashCommandBuilder()
    .setName("dice")
    .setDescription("Lancer un dé."),

new SlashCommandBuilder()
  .setName("8ball")
  .setDescription("Boule magique.")
  .addStringOption(o =>
    o.setName("question").setDescription("Question").setRequired(true)
  ),

new SlashCommandBuilder()
  .setName("emojiadd")
  .setDescription("Ajouter un emoji avec son ID.")
  .addStringOption(o =>
    o.setName("id").setDescription("ID de l'emoji").setRequired(true)
  ),

new SlashCommandBuilder()
  .setName("bl")
  .setDescription("Blacklist un utilisateur.")
  .addUserOption(o =>
    o.setName("membre").setDescription("Utilisateur").setRequired(true)
  ),

new SlashCommandBuilder()
  .setName("unbl")
  .setDescription("Retirer un utilisateur de la blacklist.")
  .addUserOption(o =>
    o.setName("membre").setDescription("Utilisateur").setRequired(true)
  ),

  // ================= STICKERADD =================

new SlashCommandBuilder()
  .setName("stickeradd")
  .setDescription("Ajouter un autocollant avec son ID.")
  .addStringOption(o =>
    o.setName("id")
      .setDescription("ID de l'autocollant")
      .setRequired(true)
  ),

new SlashCommandBuilder()
  .setName("status")
  .setDescription("Changer le statut du bot.")
  .addStringOption(o =>
    o.setName("texte")
      .setDescription("Nouveau statut")
      .setRequired(true)
  ),


].map(c => c.toJSON());

/* ================= READY ================= */

client.once("clientReady", async () => {

  console.log(`✅ ${client.user.tag} connecté !`);

  // Premier statut
  client.user.setPresence({
    activities: [{
      type: statuts[0].type,
      name: statuts[0].name,
      url: statuts[0].url
    }],
    status: "online"
  });

  // Change toutes les 10 secondes
  setInterval(() => {

    statutIndex = (statutIndex + 1) % statuts.length;

    const statut = statuts[statutIndex];

    client.user.setPresence({
      activities: [{
        type: statut.type,
        name: statut.name,
        url: statut.url
      }],
      status: "online"
    });

  }, 10000);

  // Garde ensuite TON code des commandes
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  for (const guildId of config.guildIds) {
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, guildId),
      { body: commands }
    );
    console.log(`✅ Commandes installées sur ${guildId}`);
  }

  console.log("🎉 Toutes les commandes sont enregistrées !");
});

/* ================= INTERACTIONS ================= */

client.on("interactionCreate", async interaction => {

  if (!interaction.isChatInputCommand()) return;

  const cmd = interaction.commandName;

  try {

     // ================= CLEAR =================

    if (cmd === "clear") {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
        return interaction.reply({ content: "❌ Permission refusée.", ephemeral: true });

      const nombre = interaction.options.getInteger("nombre");
      await interaction.channel.bulkDelete(nombre, true);

      return interaction.reply({
        content: `🧹 ${nombre} messages supprimés.`,
        ephemeral: true
      });
    }

    // ================= LOCK =================

    if (cmd === "lock") {
      await interaction.channel.permissionOverwrites.edit(
        interaction.guild.roles.everyone.id,
        { SendMessages: false }
      );

      return interaction.reply("🔒 Salon verrouillé.");
    }

    // ================= UNLOCK =================

    if (cmd === "unlock") {
      await interaction.channel.permissionOverwrites.edit(
        interaction.guild.roles.everyone.id,
        { SendMessages: null }
      );

      return interaction.reply("🔓 Salon déverrouillé.");
    }

    // ================= RENEW =================

    if (cmd === "renew") {
      await interaction.deferReply({ ephemeral: true });

      const oldChannel = interaction.channel;

      const newChannel = await oldChannel.clone({
        reason: `Renew demandé par ${interaction.user.tag}`
      });

      await newChannel.setPosition(oldChannel.position);
      await oldChannel.delete();

      await newChannel.send("✅ Salon renouvelé.");

      return;
    }

    // ================= SAY =================

    if (cmd === "say") {
      const texte = interaction.options.getString("message");

      await interaction.reply({
        content: "✅ Message envoyé.",
        ephemeral: true
      });

      await interaction.channel.send(texte);
      return;
    }

    // ================= EMBED =================

    if (cmd === "embed") {
      const titre = interaction.options.getString("titre");
      const description = interaction.options.getString("description");

      const embed = new EmbedBuilder()
        .setColor("#8B5CF6")
        .setTitle(`💜 ${titre}`)
        .setDescription(description)
        .setFooter({ text: config.footer })
        .setTimestamp();

      await interaction.reply({
        content: "✅ Embed envoyé.",
        ephemeral: true
      });

      await interaction.channel.send({ embeds: [embed] });

      return;
    }

    // ================= ANNOUNCE =================

    if (cmd === "announce") {
      const texte = interaction.options.getString("message");

      const embed = new EmbedBuilder()
        .setColor("#F59E0B")
        .setTitle("📢 Annonce")
        .setDescription(texte)
        .setFooter({ text: config.footer })
        .setTimestamp();

      await interaction.reply({
        content: "✅ Annonce envoyée.",
        ephemeral: true
      });

      await interaction.channel.send({ embeds: [embed] });

      return;
    }

    // ================= POLL =================

    if (cmd === "poll") {
      const question = interaction.options.getString("question");

      const msg = await interaction.reply({
        content: `📊 **SONDAGE**\n\n${question}`,
        fetchReply: true
      });

      await msg.react("👍");
      await msg.react("👎");

      return;
    }

    // ================= BAN =================

    if (cmd === "ban") {
      const membre = interaction.options.getMember("membre");
      const raison = interaction.options.getString("raison") || "Aucune raison.";

      await membre.ban({ reason: raison });

      return interaction.reply(`🔨 **${membre.user.tag}** a été banni.`);
    }

    // ================= KICK =================

    if (cmd === "kick") {
      const membre = interaction.options.getMember("membre");
      const raison = interaction.options.getString("raison") || "Aucune raison.";

      await membre.kick(raison);

      return interaction.reply(`👢 **${membre.user.tag}** a été expulsé.`);
    }

    // ================= TIMEOUT =================

    if (cmd === "timeout") {
      const membre = interaction.options.getMember("membre");
      const minutes = interaction.options.getInteger("minutes");

      await membre.timeout(minutes * 60000, "Timeout via le bot.");

      return interaction.reply(
        `⏳ ${membre} est timeout **${minutes} minute(s)**.`
      );
    }

    // ================= GIVEROLE =================

    if (cmd === "giverole") {
      const membre = interaction.options.getMember("membre");
      const role = interaction.options.getRole("role");

      await membre.roles.add(role);

      return interaction.reply(`✅ ${role} ajouté à ${membre}.`);
    }

    // ================= REMOVEROLE =================

    if (cmd === "removerole") {
      const membre = interaction.options.getMember("membre");
      const role = interaction.options.getRole("role");

      await membre.roles.remove(role);

      return interaction.reply(`❌ ${role} retiré à ${membre}.`);
    }

    // ================= SLOWMODE =================

    if (cmd === "slowmode") {
      const secondes = interaction.options.getInteger("secondes");

      await interaction.channel.setRateLimitPerUser(secondes);

      return interaction.reply(`🐢 Slowmode activé : **${secondes} secondes**.`);
    }

    // ================= NICK =================

    if (cmd === "nick") {
      const membre = interaction.options.getMember("membre");
      const pseudo = interaction.options.getString("pseudo");

      await membre.setNickname(pseudo);

      return interaction.reply(`✏️ Nouveau pseudo : **${pseudo}**`);
    }

    // ================= ADD =================

    if (cmd === "add") {
      const membre = interaction.options.getMember("membre");

      await interaction.channel.permissionOverwrites.edit(membre.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true
      });

      return interaction.reply(`✅ ${membre} ajouté au salon.`);
    }

    // ================= REMOVE =================

    if (cmd === "remove") {
      const membre = interaction.options.getMember("membre");

      await interaction.channel.permissionOverwrites.edit(membre.id, {
        ViewChannel: false
      });

      return interaction.reply(`❌ ${membre} retiré du salon.`);
    }

    // ================= HIDE =================

    if (cmd === "hide") {
      await interaction.channel.permissionOverwrites.edit(
        interaction.guild.roles.everyone.id,
        { ViewChannel: false }
      );

      return interaction.reply("🙈 Salon caché.");
    }

    // ================= UNHIDE =================

    if (cmd === "unhide") {
      await interaction.channel.permissionOverwrites.edit(
        interaction.guild.roles.everyone.id,
        { ViewChannel: true }
      );

      return interaction.reply("👀 Salon visible.");
    }
    
    // ================= AVATAR =================

    if (cmd === "avatar") {
      const membre =
        interaction.options.getMember("membre") || interaction.member;

      const embed = new EmbedBuilder()
        .setColor("#8B5CF6")
        .setTitle(`🖼 Avatar de ${membre.user.tag}`)
        .setImage(membre.user.displayAvatarURL({ size: 2048 }))
        .setFooter({ text: config.footer });

      return interaction.reply({ embeds: [embed] });
    }

    // ================= USERINFO =================

    if (cmd === "userinfo") {
      const membre =
        interaction.options.getMember("membre") || interaction.member;

      const embed = new EmbedBuilder()
        .setColor("#8B5CF6")
        .setThumbnail(membre.user.displayAvatarURL({ size: 1024 }))
        .setTitle(`👤 ${membre.user.tag}`)
        .addFields(
          { name: "🆔 ID", value: membre.id, inline: false },
          {
            name: "📅 Compte créé",
            value: `<t:${Math.floor(
              membre.user.createdTimestamp / 1000
            )}:F>`,
            inline: false
          },
          {
            name: "📥 Arrivé sur le serveur",
            value: `<t:${Math.floor(
              membre.joinedTimestamp / 1000
            )}:F>`,
            inline: false
          },
          {
            name: "🎭 Rôles",
            value: `${membre.roles.cache.size - 1}`,
            inline: true
          }
        )
        .setFooter({ text: config.footer });

      return interaction.reply({ embeds: [embed] });
    }

    // ================= SERVERINFO =================

    if (cmd === "serverinfo") {
      const g = interaction.guild;

      const embed = new EmbedBuilder()
        .setColor("#8B5CF6")
        .setThumbnail(g.iconURL({ size: 1024 }))
        .setTitle(`🌍 ${g.name}`)
        .addFields(
          {
            name: "👥 members",
            value: `${g.memberCount}`,
            inline: true
          },
          {
            name: "💎 boosts",
            value: `${g.premiumSubscriptionCount}`,
            inline: true
          },
          {
            name: "💬 salons",
            value: `${g.channels.cache.size}`,
            inline: true
          },
          {
            name: "🎭 nbr 2 rôles",
            value: `${g.roles.cache.size}`,
            inline: true
          },
          {
            name: "📅 creation date",
            value: `<t:${Math.floor(g.createdTimestamp / 1000)}:D>`,
            inline: false
          }
        )
        .setFooter({ text: config.footer });

      return interaction.reply({ embeds: [embed] });
    }

    // ================= MEMBERCOUNT =================

    if (cmd === "membercount") {
      return interaction.reply(
        `👥 y'a **${interaction.guild.memberCount} membres** sur le serveur.`
      );
    }

    // ================= PING =================

    if (cmd === "ping") {
      return interaction.reply(`🏓 Pong ! **${client.ws.ping} ms**`);
    }

    // ================= VOICECREATE =================

    if (cmd === "voicecreate") {
      const nom = interaction.options.getString("nom");

      const vocal = await interaction.guild.channels.create({
        name: nom,
        type: ChannelType.GuildVoice
      });

      return interaction.reply(`🎙️ Salon vocal créé : ${vocal}`);
    }

    // ================= TEXTCREATE =================

    if (cmd === "textcreate") {
      const nom = interaction.options.getString("nom");

      const salon = await interaction.guild.channels.create({
        name: nom,
        type: ChannelType.GuildText
      });

      return interaction.reply(`💬 Salon créé : ${salon}`);
    }

    // ================= RENAME =================

    if (cmd === "rename") {
      const nom = interaction.options.getString("nom");

      await interaction.channel.setName(nom);

      return interaction.reply(`✏️ Salon renommé en **${nom}**`);
    }

    // ================= DELETECHANNEL =================

    if (cmd === "deletechannel") {
      await interaction.reply("🗑️ Suppression du salon...");

      await interaction.channel.delete();

      return;
    }

    // ================= TICKET =================

    if (cmd === "ticket") {
      const category = interaction.guild.channels.cache.find(
        c => c.name === "Tickets" && c.type === ChannelType.GuildCategory
      );

      const ticket = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: category ? category.id : null,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages
            ]
          }
        ]
      });

      await ticket.send(
        `🎫 Bonjour ${interaction.user}, explique ton problème ici.`
      );

      return interaction.reply({
        content: `✅ Ticket créé : ${ticket}`,
        ephemeral: true
      });
    }

    // ================= CLOSE =================

    if (cmd === "close") {
      await interaction.reply("🔒 Fermeture du ticket dans 5 secondes...");

      setTimeout(async () => {
        await interaction.channel.delete();
      }, 5000);

      return;
    }

    // ================= COINFLIP =================

    if (cmd === "coinflip") {
      const resultat =
        Math.random() < 0.5 ? "🪙 **PILE**" : "🪙 **FACE**";

      return interaction.reply(resultat);
    }

    // ================= DICE =================

    if (cmd === "dice") {
      const nombre = Math.floor(Math.random() * 6) + 1;

      return interaction.reply(`🎲 Tu as obtenu **${nombre}**`);
    }

    // ================= 8BALL =================

    if (cmd === "8ball") {
      const question = interaction.options.getString("question");

      const reponses = [
        "✅ Oui.",
        "❌ Non.",
        "🤔 Peut-être.",
        "😎 Certainement.",
        "⌛ Réessaie plus tard.",
        "😂 Impossible."
      ];

      const rep =
        reponses[Math.floor(Math.random() * reponses.length)];

      return interaction.reply(`🎱 **Question :** ${question}\n\n${rep}`);
    }

    // ================= RAIDUNLOCK =================

    if (cmd === "raidunlock") {
      let total = 0;

      for (const channel of interaction.guild.channels.cache.values()) {
        if (channel.type === ChannelType.GuildText) {
          await channel.permissionOverwrites.edit(
            interaction.guild.roles.everyone.id,
            { SendMessages: null }
          );

          total++;
        }
      }

      return interaction.reply(
        `✅ **${total} salons** ont été déverrouillés.`
      );
    }


    // ================= EMOJIADD =================
if (cmd === "emojiadd") {
  const emojiId = interaction.options.getString("id");

  try {
    const emoji = await interaction.guild.emojis.create({
      attachment: `https://cdn.discordapp.com/emojis/${emojiId}.png`,
      name: `emoji_${emojiId}`
    });

    return interaction.reply(`✅ Emoji ajouté : ${emoji}`);
  } catch {
    return interaction.reply({
      content: "❌ Impossible d'ajouter cet emoji.",
      ephemeral: true
    });
  }
}

// ================= BLACKLIST =================
if (cmd === "bl") {
  const membre = interaction.options.getUser("membre");
  blacklist.add(membre.id);
  return interaction.reply(`⛔ ${membre.tag} est blacklist du bot.`);
}

// ================= UNBLACKLIST =================
if (cmd === "unbl") {
  const membre = interaction.options.getUser("membre");
  blacklist.delete(membre.id);
  return interaction.reply(`✅ ${membre.tag} n'est plus blacklist du bot.`);
}

// ================= STICKERADD =================

if (cmd === "stickeradd") {

  const stickerId = interaction.options.getString("id");

  try {

    const url = `https://media.discordapp.net/stickers/${stickerId}.png`;

    const sticker = await interaction.guild.stickers.create({
      file: url,
      name: `sticker_${stickerId}`,
      tags: "emoji"
    });

    return interaction.reply(`✅ Autocollant ajouté : **${sticker.name}**`);

  } catch (err) {
    console.error(err);

    return interaction.reply({
      content: "❌ Impossible d'ajouter cet autocollant. Vérifie l'ID ou les permissions du bot.",
      ephemeral: true
    });
  }

// ================= STATUS =================

if (cmd === "status") {

  // Seul le propriétaire peut changer les statuts
  if (interaction.user.id !== config.ownerId) {
    return interaction.reply({
      content: "❌ Seul le propriétaire du bot peut utiliser cette commande.",
      ephemeral: true
    });
  }

  const texte = interaction.options.getString("texte");

  // Remplace le premier statut de la rotation
  statuts[0] = {
    type: 0, // 0 = Joue à
    name: texte
  };

  // L'applique immédiatement
  client.user.setPresence({
    activities: [statuts[0]],
    status: "online"
  });

  return interaction.reply({
    content: `✅ Nouveau statut : **Joue à ${texte}**`,
    ephemeral: true
  });

}

}

  } catch (err) {
    console.error("Erreur :", err);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "❌ Une erreur est survenue.",
        ephemeral: true
      });
    }
  }
});

/* ================= ANTI-SPAM ================= */

const spamMap = new Map();

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const now = Date.now();
  let data = spamMap.get(message.author.id);

  if (!data) data = { count: 0, last: now };

  if (now - data.last > 5000) data.count = 0;

  data.count++;
  data.last = now;

  spamMap.set(message.author.id, data);

  if (data.count >= 5) {
    spamMap.delete(message.author.id);

    try {
      await message.member.timeout(5 * 60 * 1000, "Spam détecté");

      await message.channel.send(
        `🚫 ${message.author} a été mute **5 minutes** pour spam.`
      );
    } catch (err) {
      console.error(err);
    }
  }
});

/* ================= ANTI-LINK ================= */

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const liens = /(https?:\/\/|discord\.gg\/|discord\.com\/invite\/)/i;

  if (liens.test(message.content)) {
    if (
      message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)
    )
      return;

    await message.delete().catch(() => {});

    message.channel.send({
      content: `🚫 ${message.author}, les liens sont interdits ici.`
    });
  }
});

/* ================= ANTI RAID ================= */

const joins = [];

client.on("guildMemberAdd", async (member) => {
  joins.push(Date.now());

  while (joins.length && Date.now() - joins[0] > 10000) {
    joins.shift();
  }

  if (joins.length >= 10) {
    try {
      for (const channel of member.guild.channels.cache.values()) {
        if (channel.type === ChannelType.GuildText) {
          await channel.permissionOverwrites.edit(
            member.guild.roles.everyone.id,
            { SendMessages: false }
          );
        }
      }

      const logs = member.guild.channels.cache.find(
        c => c.name === "logs"
      );

      if (logs) {
        logs.send("🚨 **RAID détecté ! Tous les salons ont été verrouillés.**");
      }
    } catch (err) {
      console.error(err);
    }
  }
});

// ================= BIENVENUE =================

client.on("guildMemberAdd", async (member) => {

  const salon = member.guild.channels.cache.get(config.welcomeChannelId);

  if (!salon) return;

  const embed = new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle("🎉 Bienvenue !")
    .setThumbnail(member.user.displayAvatarURL({ size: 1024 }))
    .setDescription(
      `Bienvenue ${member} sur **${member.guild.name}** ! 💜\n\n` +
      `Tu es le **${member.guild.memberCount}e membre** du serveur.`
    )
    .setFooter({ text: config.footer })
    .setTimestamp();

  await salon.send({
    content: `👋 Bienvenue ${member} !`,
    embeds: [embed]
  });

});

// ================= AU REVOIR =================

client.on("guildMemberRemove", async (member) => {
  const salon = member.guild.channels.cache.get(config.goodbyeChannelId);

  if (!salon) {
    console.log("❌ Salon au-revoir introuvable !");
    return;
  }

  const embed = new EmbedBuilder()
    .setColor("#EF4444")
    .setTitle("👋 zbi il es parti")
    .setThumbnail(member.user.displayAvatarURL({ size: 1024 }))
    .setDescription(
      `**${member.user.tag}** a quitté **${member.guild.name}**.\n\n` +
      `👥 Il reste **${member.guild.memberCount} membres** sur le serveur.`
    )
    .setFooter({ text: config.footer })
    .setTimestamp();

  await salon.send({
    content: `Au revoir ${member} 👋`,
    embeds: [embed],
  });
});

/* ================= LOGS ================= */

client.on("messageDelete", async (message) => {
  if (!message.guild || message.author?.bot) return;

  const logs = message.guild.channels.cache.find(
    c => c.name === "logs"
  );

  if (!logs) return;

  const embed = new EmbedBuilder()
    .setColor("#EF4444")
    .setTitle("🗑️ Message supprimé")
    .addFields(
      {
        name: "Auteur",
        value: `${message.author.tag}`,
        inline: true
      },
      {
        name: "Salon",
        value: `${message.channel}`,
        inline: true
      },
      {
        name: "Message",
        value: message.content || "*Aucun texte*"
      }
    )
    .setTimestamp();

  logs.send({ embeds: [embed] });
});

client.on("messageUpdate", async (oldMsg, newMsg) => {
  if (!newMsg.guild || newMsg.author?.bot) return;
  if (oldMsg.content === newMsg.content) return;

  const logs = newMsg.guild.channels.cache.find(
    c => c.name === "logs"
  );

  if (!logs) return;

  const embed = new EmbedBuilder()
    .setColor("#F59E0B")
    .setTitle("✏️ Message modifié")
    .addFields(
      {
        name: "Auteur",
        value: `${newMsg.author.tag}`,
        inline: true
      },
      {
        name: "Salon",
        value: `${newMsg.channel}`,
        inline: true
      },
      {
        name: "Avant",
        value: oldMsg.content || "*Vide*"
      },
      {
        name: "Après",
        value: newMsg.content || "*Vide*"
      }
    )
    .setTimestamp();

  logs.send({ embeds: [embed] });
});

/* ================= GESTION DES ERREURS ================= */

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

/* ================= CONNEXION ================= */

client.login(process.env.DISCORD_TOKEN);    