import 'dotenv/config';
import { Client, GatewayIntentBits, Events, Collection } from 'discord.js';
import * as summonerCommand from './commands/summoner';

// Extend Client type to hold commands
declare module 'discord.js' {
  interface Client {
    commands: Collection<string, typeof summonerCommand>;
  }
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// Register commands
client.commands.set(summonerCommand.data.name, summonerCommand);

client.once(Events.ClientReady, (c) => {
  console.log(`✅ Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    const msg = { content: '⚠️ コマンドの実行中にエラーが発生しました。', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(msg);
    } else {
      await interaction.reply(msg);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
