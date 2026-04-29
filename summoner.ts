import {
  ChatInputCommandInteraction,
  AttachmentBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import {
  getAccountByRiotId,
  getSummonerByPuuid,
  getLeagueEntries,
  profileIconUrl,
} from '../riot/api';
import { buildSummonerCard } from '../image/card';

export const data = new SlashCommandBuilder()
  .setName('lol')
  .setDescription('LOLプレイヤーの情報を表示します')
  .addStringOption(option =>
    option
      .setName('riot_id')
      .setDescription('Riot ID（例: 山田太郎#JP1）')
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const riotId = interaction.options.getString('riot_id', true).trim();

  // Parse "Name#Tag"
  const hashIdx = riotId.lastIndexOf('#');
  if (hashIdx === -1 || hashIdx === riotId.length - 1) {
    await interaction.editReply('❌ Riot ID の形式が正しくありません。例: `山田太郎#JP1`');
    return;
  }
  const gameName = riotId.slice(0, hashIdx);
  const tagLine  = riotId.slice(hashIdx + 1);

  try {
    // 1. PUUID を取得
    const account = await getAccountByRiotId(gameName, tagLine);

    // 2. Summoner 情報を取得
    const summoner = await getSummonerByPuuid(account.puuid);

    // 3. ランク情報を取得
    const entries = await getLeagueEntries(summoner.id);

    // 4. プロフィールアイコン URL
    const iconUrl = profileIconUrl(summoner.profileIconId);

    // 5. 画像生成
    const imageBuffer = await buildSummonerCard(summoner, account, entries, iconUrl);

    const attachment = new AttachmentBuilder(imageBuffer, { name: 'summoner.png' });
    await interaction.editReply({ files: [attachment] });
  } catch (err: any) {
    console.error(err?.response?.data ?? err);
    const status = err?.response?.status;
    if (status === 404) {
      await interaction.editReply(`❌ **${riotId}** が見つかりませんでした。`);
    } else if (status === 403) {
      await interaction.editReply('❌ Riot API キーが無効です。');
    } else {
      await interaction.editReply('⚠️ エラーが発生しました。しばらくしてから再試行してください。');
    }
  }
}
