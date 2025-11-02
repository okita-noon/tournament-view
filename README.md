# 戦転 GROOVE - THE DESK SHOWDOWN

トーナメント管理アプリケーション

## 機能

- 8人トーナメント（準々決勝→準決勝→決勝）
- Framer Motionによる滑らかなアニメーション
- 自動保存（ブラウザのローカルストレージ）
- レスポンシブデザイン

## 開発

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

## デプロイ（Vercel）

### 方法1: Vercel CLI

```bash
# Vercel CLIのインストール
npm install -g vercel

# デプロイ
vercel

# 本番環境へのデプロイ
vercel --prod
```

### 方法2: GitHub連携

1. GitHubにリポジトリをプッシュ
2. [Vercel](https://vercel.com)にアクセス
3. "New Project"をクリック
4. GitHubリポジトリをインポート
5. "Deploy"をクリック

Vercelが自動的にViteプロジェクトを検出し、適切な設定でデプロイします。

### 方法3: GitHub Pagesへのデプロイ

`vite.config.js`に以下を追加：

```js
export default defineConfig({
  plugins: [react()],
  base: '/repository-name/', // リポジトリ名に変更
})
```

そして：

```bash
npm run build
# distフォルダの内容をgh-pagesブランチにプッシュ
```

## 技術スタック

- React 18
- Vite
- Framer Motion
- CSS3
