import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { data as summonerData } from './commands/summoner';

const token    = process.env.DISCORD_TOKEN    ?? '';
const clientId = process.env.DISCORD_CLIENT_ID ?? '';

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log('⏳ スラッシュコマンドを登録中...');
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: [summonerData.toJSON()] }
    );
    console.log('✅ グローバルコマンドの登録が完了しました。');
    console.log('   ※ グローバル反映には最大 1 時間かかります。');
  } catch (error) {
    console.error(error);
  }
})();
