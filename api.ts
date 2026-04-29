import axios from 'axios';

const RIOT_BASE = 'https://jp1.api.riotgames.com';
const ASIA_BASE  = 'https://asia.api.riotgames.com';

export interface AccountDto {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export interface SummonerDto {
  id: string;
  accountId: string;
  puuid: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

export interface LeagueEntryDto {
  leagueId: string;
  summonerId: string;
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
}

const headers = () => ({
  'X-Riot-Token': process.env.RIOT_API_KEY ?? '',
});

/** Riot ID (GameName#Tag) → PUUID */
export async function getAccountByRiotId(
  gameName: string,
  tagLine: string
): Promise<AccountDto> {
  const url = `${ASIA_BASE}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  const res = await axios.get<AccountDto>(url, { headers: headers() });
  return res.data;
}

/** PUUID → Summoner */
export async function getSummonerByPuuid(puuid: string): Promise<SummonerDto> {
  const url = `${RIOT_BASE}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
  const res = await axios.get<SummonerDto>(url, { headers: headers() });
  return res.data;
}

/** Summoner ID → League entries */
export async function getLeagueEntries(summonerId: string): Promise<LeagueEntryDto[]> {
  const url = `${RIOT_BASE}/lol/league/v4/entries/by-summoner/${summonerId}`;
  const res = await axios.get<LeagueEntryDto[]>(url, { headers: headers() });
  return res.data;
}

/** Profile icon URL */
export function profileIconUrl(iconId: number): string {
  return `https://ddragon.leagueoflegends.com/cdn/14.4.1/img/profileicon/${iconId}.png`;
}
