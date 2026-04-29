import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import type { SummonerDto, LeagueEntryDto } from '../riot/api';

const W = 520;
const H = 200;

const TIER_COLORS: Record<string, string> = {
  IRON:        '#8a8a8a',
  BRONZE:      '#c87c3d',
  SILVER:      '#a0afc0',
  GOLD:        '#d4af37',
  PLATINUM:    '#25d490',
  EMERALD:     '#00c878',
  DIAMOND:     '#7ec8e3',
  MASTER:      '#9b59b6',
  GRANDMASTER: '#e74c3c',
  CHALLENGER:  '#f39c12',
  UNRANKED:    '#888888',
};

function tierColor(tier: string): string {
  return TIER_COLORS[tier.toUpperCase()] ?? TIER_COLORS['UNRANKED'];
}

function rankLabel(entry: LeagueEntryDto | undefined): string {
  if (!entry) return 'Unranked';
  const { tier, rank, leaguePoints } = entry;
  if (['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(tier)) {
    return `${tier} ${leaguePoints} LP`;
  }
  return `${tier} ${rank} — ${leaguePoints} LP`;
}

function winRate(entry: LeagueEntryDto | undefined): string {
  if (!entry) return '—';
  const total = entry.wins + entry.losses;
  if (total === 0) return '—';
  return `${Math.round((entry.wins / total) * 100)}%  (${entry.wins}W / ${entry.losses}L)`;
}

export async function buildSummonerCard(
  summoner: SummonerDto,
  account: { gameName: string; tagLine: string },
  entries: LeagueEntryDto[],
  iconUrl: string
): Promise<Buffer> {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0f1923');
  bg.addColorStop(1, '#1a2a3a');
  ctx.fillStyle = bg;
  ctx.roundRect(0, 0, W, H, 16);
  ctx.fill();

  // Accent line (top)
  const soloEntry = entries.find(e => e.queueType === 'RANKED_SOLO_5x5');
  ctx.fillStyle = tierColor(soloEntry?.tier ?? 'UNRANKED');
  ctx.fillRect(0, 0, W, 4);
  ctx.beginPath();
  ctx.roundRect(0, 0, W, 4, [16, 16, 0, 0]);
  ctx.fill();

  // Profile icon (clipped circle)
  const iconSize = 80;
  const iconX = 28;
  const iconY = (H - iconSize) / 2;
  ctx.save();
  ctx.beginPath();
  ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
  ctx.clip();
  try {
    const icon = await loadImage(iconUrl);
    ctx.drawImage(icon, iconX, iconY, iconSize, iconSize);
  } catch {
    ctx.fillStyle = '#1e3a5f';
    ctx.fill();
  }
  ctx.restore();

  // Icon border
  ctx.strokeStyle = tierColor(soloEntry?.tier ?? 'UNRANKED');
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2 + 1, 0, Math.PI * 2);
  ctx.stroke();

  // Summoner level badge
  ctx.fillStyle = '#0d1117';
  ctx.strokeStyle = '#c89b3c';
  ctx.lineWidth = 1.5;
  const badgeY = iconY + iconSize - 16;
  const badgeX = iconX + iconSize / 2;
  ctx.beginPath();
  ctx.roundRect(badgeX - 20, badgeY, 40, 18, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#c89b3c';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Lv.${summoner.summonerLevel}`, badgeX, badgeY + 13);

  // Name + tag
  const textX = iconX + iconSize + 20;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#e8d8b0';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(account.gameName, textX, 58);
  ctx.fillStyle = '#8899aa';
  ctx.font = '14px sans-serif';
  ctx.fillText(`#${account.tagLine}`, textX + ctx.measureText(account.gameName).width + 6, 58);

  // Divider
  ctx.strokeStyle = '#ffffff18';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(textX, 70);
  ctx.lineTo(W - 24, 70);
  ctx.stroke();

  // Solo/Duo label
  ctx.fillStyle = '#aabbcc';
  ctx.font = '12px sans-serif';
  ctx.fillText('RANKED SOLO/DUO', textX, 92);

  // Rank
  ctx.fillStyle = tierColor(soloEntry?.tier ?? 'UNRANKED');
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText(rankLabel(soloEntry), textX, 116);

  // Win rate
  ctx.fillStyle = '#99aabb';
  ctx.font = '13px sans-serif';
  ctx.fillText(`Win Rate  ${winRate(soloEntry)}`, textX, 138);

  // Flex rank (if exists)
  const flexEntry = entries.find(e => e.queueType === 'RANKED_FLEX_SR');
  if (flexEntry) {
    ctx.fillStyle = '#aabbcc';
    ctx.font = '12px sans-serif';
    ctx.fillText('RANKED FLEX', textX, 160);
    ctx.fillStyle = tierColor(flexEntry.tier);
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(rankLabel(flexEntry), textX, 178);
  }

  // Watermark
  ctx.fillStyle = '#ffffff18';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('LOL Bot', W - 16, H - 10);

  return canvas.toBuffer('image/png');
}
