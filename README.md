# LOL Discord Bot

LOLプレイヤーのサモナー情報を画像で返す Discord Bot です。

## 必要なもの

| 項目 | 取得先 |
|------|--------|
| Discord Bot Token | [Discord Developer Portal](https://discord.com/developers/applications) |
| Discord Application ID | 同上（Application ID） |
| Riot API Key | [Riot Developer Portal](https://developer.riotgames.com/) |

---

## セットアップ手順

### 1. Discord Developer Portal

1. [Discord Developer Portal](https://discord.com/developers/applications) でアプリを作成
2. **Bot** タブ → `Add Bot` → Token をコピー
3. **OAuth2 → URL Generator** で scope に `bot` + `applications.commands` を選択
4. Bot Permissions: `Send Messages`, `Attach Files` を選択
5. 生成された URL でサーバーに招待

### 2. Riot API Key

1. [developer.riotgames.com](https://developer.riotgames.com/) にログイン
2. Development API Key をコピー（24時間有効、本番は Production Key を申請）

### 3. ローカル起動

```bash
# 1. 依存関係インストール
npm install

# 2. 環境変数を設定
cp .env.example .env
# .env を編集して各キーを入力

# 3. スラッシュコマンドを Discord に登録（初回のみ）
npm run register

# 4. Bot を起動
npm run dev
```

### 4. Render へのデプロイ

1. GitHub にリポジトリを push
2. [render.com](https://render.com) でアカウント作成 → `New Web Service`
3. リポジトリを接続
4. 設定:
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
5. **Environment** タブで以下の環境変数を追加:
   - `DISCORD_TOKEN`
   - `DISCORD_CLIENT_ID`
   - `RIOT_API_KEY`
6. Deploy → ログで `✅ Logged in as ...` が出れば成功

---

## 使い方

Discord で:
```
/lol riot_id: 山田太郎#JP1
```

サモナーカード画像が返信されます。

---

## 注意事項

- Riot API の Development Key は 24 時間で失効します
- 本番運用には [Production Key の申請](https://developer.riotgames.com/docs/portal#product-registration_product-approval) が必要です
- Render の Free tier は 15 分間アクセスがないとスリープします（有料プランで回避可）
"# LOL_BOT"  
