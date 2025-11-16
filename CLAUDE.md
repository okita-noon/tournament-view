# トーナメント表示アプリケーション - 開発ガイド

このファイルは、このリポジトリでコードを扱う際のClaude Codeへのガイダンスを提供します。

## プロジェクト概要

12人参加のシングルエリミネーション形式のトーナメント表示アプリケーション。
シード選手を含み、Quarter Finals (QF) → Semi Finals (SF) → 準決勝 (Semi) → 決勝 (Final) と進行します。
選手の勝ち上がりは赤いアニメーション線で視覚的に表示されます。

### 技術スタック
- **React 18** + **Vite** - 高速な開発環境
- **Framer Motion 11** - 滑らかなアニメーション（プレート移動、経路線）
- **LocalStorage** - 状態の永続化
- **GitHub Actions** - 自動デプロイメント (GitHub Pages)

## 開発コマンド

```bash
# 開発サーバー起動 (http://localhost:5173)
npm run dev

# 本番ビルド
npm run build

# 本番ビルドのプレビュー
npm run preview

# GitHub Pagesへデプロイ（mainブランチへのpushで自動実行）
git push
```

### デバッグ用ショートカット
- **Ctrl/Cmd + Shift + R**: 全プレート位置をリセット（configから再読み込み）
- HMR: `tournamentConfig.js`の変更を自動検知して位置を再読み込み

## アーキテクチャと重要概念

### 状態管理 (App.jsx)

Reactの`useState`とLocalStorageで以下を管理：

```javascript
players: string[]              // 12人のプレイヤー名
playerPositions: Array<{       // 各スロットの現在位置（左上座標、%単位）
  slot: number,
  x: number,
  y: number
}>
champion: string | null        // 優勝者名
matchResults: {                // 全試合結果
  [matchId]: {
    winner: number,            // 勝者のスロット番号
    loser: number              // 敗者のスロット番号
  }
}
history: Array<State>          // Undo用の履歴（最大50ステップ）
```

### 座標系の二重構造 ⚠️ 最重要

このアプリケーションは**2つの座標系**を使用します：

#### 1. 設定ファイル (tournamentConfig.js) - 中心座標
すべての位置定義は**プレート画像の中心座標**として定義（%単位）：
```javascript
QF_WINNER_POSITIONS = [
  { x: 34, y: 21.5, index: 0 },  // x, y = 中心座標
  ...
]
```

#### 2. 状態管理 (playerPositions) - 左上座標
Reactの状態では**プレートの左上座標**として保存（%単位）：
```javascript
playerPositions = [
  { slot: 0, x: -3.75, y: 5.45 },  // x, y = 左上座標
  ...
]
```

#### 座標変換の必須パターン

**中心 → 左上** (プレート移動時):
```javascript
const leftTopX = centerX - (SLOT_WIDTH / 2)
const leftTopY = centerY - (SLOT_HEIGHT / 2)
```

**左上 → 中心** (位置比較時):
```javascript
const centerX = pos.x + (SLOT_WIDTH / 2)
const centerY = pos.y + (SLOT_HEIGHT / 2)
```

#### なぜ2つの座標系が必要か
- **中心座標（config）**: 測定ツールで画像の中心をクリックした値をそのまま保存。直感的で測定しやすい。
- **左上座標（state）**: CSSの`left`, `top`プロパティは左上を基準とするため。

### 設定ファイル (tournamentConfig.js)

トーナメントのレイアウトを一元管理：

```javascript
// デバッグフラグ
DEBUG_SHOW_CENTER_MARKERS    // 中心点マーカー表示
DEBUG_COORDINATE_PICKER      // クリックで座標取得

// 背景画像サイズ（座標測定時の表示サイズ）
IMAGE_WIDTH = 3840
IMAGE_HEIGHT = 2160

// スロットサイズ（画像に対する%）
SLOT_WIDTH = 28.5
SLOT_HEIGHT = SLOT_WIDTH / 4.1  // アスペクト比 4.1:1

// 位置定義（全て中心座標、%単位）
SLOT_POSITIONS              // 初期12スロット位置
QF_WINNER_POSITIONS         // QF勝者の移動先 (4箇所)
SF_WINNER_POSITIONS         // SF勝者の移動先 (4箇所)
FINAL_PLAYER_POSITIONS      // 決勝進出者の位置 (2箇所)
CHAMPION_POSITION           // 優勝者の位置 (1箇所)

// 勝利経路アニメーションの経由点
MATCH_PATHS = {
  qf0_slot1: [...],         // QF0でslot1が勝った場合の経路
  qf0_slot2: [...],         // QF0でslot2が勝った場合の経路
  ...
}

// プレイヤー画像（GitHub Pages対応）
PLAYER_SLOT_IMAGES = {
  0: `${import.meta.env.BASE_URL}iroziro.png`,
  ...
}
```

### 試合構造とフロー

#### トーナメント進行
```
Round 1 (QF - Quarter Finals):
  qf0: slot1 vs slot2  → QF_WINNER_POSITIONS[0]
  qf1: slot3 vs slot4  → QF_WINNER_POSITIONS[1]
  qf2: slot7 vs slot8  → QF_WINNER_POSITIONS[2]
  qf3: slot9 vs slot10 → QF_WINNER_POSITIONS[3]

Round 2 (SF - Semi Finals):
  sf0: slot0 (seed) vs qf0Winner → SF_WINNER_POSITIONS[0]
  sf1: slot5 (seed) vs qf1Winner → SF_WINNER_POSITIONS[1]
  sf2: slot6 (seed) vs qf2Winner → SF_WINNER_POSITIONS[2]
  sf3: slot11(seed) vs qf3Winner → SF_WINNER_POSITIONS[3]

Round 3 (準決勝):
  semi0: sf0Winner vs sf1Winner → FINAL_PLAYER_POSITIONS[0]
  semi1: sf2Winner vs sf3Winner → FINAL_PLAYER_POSITIONS[1]

Round 4 (決勝):
  final: semi0Winner vs semi1Winner → CHAMPION_POSITION
```

#### シード選手
slot 0, 5, 6, 11 の4名がシード選手として、Round 2から参加。

### 試合経路システム

各試合には**2つの経路**が存在（勝者によって異なる）。

#### 経路キーの命名規則
```
{matchId}_{winner}

例:
- qf0_slot1: QF0でslot1が勝った場合
- qf0_slot2: QF0でslot2が勝った場合
- sf0_slot0: SF0でslot0（シード）が勝った場合
- sf0_qfWinner0: SF0でQF0勝者が勝った場合
- semi0_sfWinner0: 準決勝0でSF0勝者が勝った場合
- semi0_sfWinner1: 準決勝0でSF1勝者が勝った場合
```

#### 経路判定ロジック (Tournament.jsx)

`getAllWinnerPaths()`関数が`matchResults`から経路を判定：

```javascript
// QFの場合：スロット番号で判定
if (matchId === 'qf0') {
  pathKey = result.winner === 1 ? 'qf0_slot1' : 'qf0_slot2'
}

// SFの場合：シードかQF勝者かで判定
else if (matchId === 'sf0') {
  pathKey = result.winner === 0 ? 'sf0_slot0' : 'sf0_qfWinner0'
}

// 準決勝の場合：どのSF試合の勝者かで判定
else if (matchId === 'semi0') {
  const isSfWinner0 = matchResults['sf0']?.winner === result.winner
  pathKey = isSfWinner0 ? 'semi0_sfWinner0' : 'semi0_sfWinner1'
}

// 決勝の場合：どの準決勝の勝者かで判定
else if (matchId === 'final') {
  const isSemi0Winner = matchResults['semi0']?.winner === result.winner
  pathKey = isSemi0Winner ? 'final_player0' : 'final_player1'
}
```

**重要**: 準決勝以降は、位置ではなく`matchResults`から判定する必要があります。
なぜなら、移動アニメーション時には既に位置が変わっているためです。

### プレートの二重レンダリング

選手プレートは**2回レンダリング**されます：

#### 1. 初期位置プレート（常に表示）
```jsx
{SLOT_POSITIONS.map((initialPos) => (
  <div
    key={`initial-${initialPos.slot}`}
    style={{
      position: 'absolute',
      left: `${initialPos.x}%`,  // 固定位置
      top: `${initialPos.y}%`,
      // ...
    }}
  >
    <PlayerSlot ... />
  </div>
))}
```

#### 2. 移動プレート（アニメーション）
```jsx
{SLOT_POSITIONS.map((initialPos) => {
  const pos = playerPositions.find(p => p.slot === initialPos.slot)
  const isAtInitialPosition = /* 初期位置と同じか判定 */

  return (
    <motion.div
      key={`moved-${initialPos.slot}`}
      initial={{
        left: `${initialPos.x}%`,  // 初期位置から開始
        top: `${initialPos.y}%`,
        opacity: 0,
      }}
      animate={{
        left: `${pos.x}%`,         // 現在位置へ移動
        top: `${pos.y}%`,
        opacity: isAtInitialPosition ? 0 : 1,  // 初期位置なら非表示
      }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <PlayerSlot ... />
    </motion.div>
  )
})}
```

#### なぜ二重レンダリングが必要か
- 勝者が移動しても、元の位置にプレートが残り続ける
- 視覚的に「このプレイヤーはここから勝ち上がった」と分かる
- 移動プレートは`initial`プロパティで元の位置から開始することで、正しい位置からのアニメーションを実現

### 敗者判定システム

**位置ベースではなく、matchResultsベースで判定**：

```javascript
const isLoser = (slotIndex) => {
  return Object.values(matchResults).some(
    (result) => result.loser === slotIndex
  )
}
```

過去の実装では位置ベースで判定していましたが、以下の問題がありました：
- アニメーション中の位置判定が不正確
- 複雑なロジックになりバグの温床
- `matchResults`に既に情報があるのに二重管理

### 履歴とUndo機能

#### 履歴の保存
`advanceToBracket()`実行前に、完全な状態をスナップショット：

```javascript
const advanceToBracket = (matchId, winnerSlot, loserSlot) => {
  setHistory(prev => {
    const newHistory = [...prev, {
      players: [...players],
      playerPositions: playerPositions.map(p => ({ ...p })),
      champion,
      matchResults: { ...matchResults }
    }]
    return newHistory.slice(-50)  // 最大50ステップ
  })

  // 試合結果を記録、プレート移動...
}
```

#### Undoの実行
最後の状態を復元し、履歴から削除：

```javascript
const undo = () => {
  if (history.length === 0) return

  const previousState = history[history.length - 1]
  setPlayers(previousState.players)
  setPlayerPositions(previousState.playerPositions)
  setChampion(previousState.champion)
  setMatchResults(previousState.matchResults)

  setHistory(prev => prev.slice(0, -1))
}
```

### GitHub Pagesデプロイ

#### 設定 (vite.config.js)
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/tournament-view/',  // リポジトリ名と一致させる
})
```

#### 画像パスの処理
絶対パス (`/image.png`) は使わず、`import.meta.env.BASE_URL`を使用：

```javascript
// ❌ NG: GitHub Pagesで動かない
backgroundImage: `url(/Tournament_4K.png)`

// ✅ OK: BASE_URLを使う
backgroundImage: `url(${import.meta.env.BASE_URL}Tournament_4K.png)`
```

#### 自動デプロイ (.github/workflows/deploy.yml)
mainブランチへのpush時に自動実行：
1. Node.js 20環境をセットアップ
2. `npm ci`で依存関係インストール
3. `npm run build`でビルド
4. `peaceiris/actions-gh-pages@v3`でgh-pagesブランチへデプロイ

## デバッグツール

### 座標測定ツール

`tournamentConfig.js`でフラグを有効化：

```javascript
export const DEBUG_COORDINATE_PICKER = true
```

画面をクリックすると、右上に座標が表示されます：
- 中心座標（そのままconfigに貼り付け可能）
- 左上座標（参考用）

### 中心点マーカー

```javascript
export const DEBUG_SHOW_CENTER_MARKERS = true
```

各位置の中心に小さな点を表示して、位置合わせをデバッグ。

### HMR（ホットモジュールリプレースメント）

開発サーバー起動中、`tournamentConfig.js`を編集すると：
1. 自動的に変更を検知
2. ページをリロードせずに位置を再読み込み
3. コンソールに「tournamentConfig.js が更新されました」と表示

測定 → config編集 → 即座に反映 → 再測定のサイクルが高速化されます。

## よくある問題と解決方法

### 問題1: 同じ試合の勝者が異なる位置に移動する

**原因**: 位置定義が中心座標と左上座標で混在している

**解決**:
1. `tournamentConfig.js`の全ての位置は中心座標で統一
2. 比較時は必ず左上→中心に変換：
   ```javascript
   const centerX = pos.x + SLOT_WIDTH / 2
   const centerY = pos.y + SLOT_HEIGHT / 2
   ```

### 問題2: 経路が表示されない（準決勝以降）

**原因**: 位置ベースで経路を判定しようとしている

**解決**: `matchResults`から判定する：
```javascript
// ❌ NG: 位置で判定（アニメーション中は位置が変わっている）
const isSfWinner0 = /* 位置比較 */

// ✅ OK: matchResultsで判定
const isSfWinner0 = matchResults['sf0']?.winner === result.winner
```

### 問題3: GitHub Pagesで画像が表示されない

**原因**: 絶対パスを使用している

**解決**: 全ての画像パスに`import.meta.env.BASE_URL`を追加
```javascript
// CSS内ではなく、JSXのinlineスタイルで
style={{
  backgroundImage: `url(${import.meta.env.BASE_URL}Tournament_4K.png)`
}}
```

### 問題4: プレートが変な位置からアニメーション開始

**原因**: `motion.div`の`initial`プロパティが未設定

**解決**: 必ず初期位置を指定：
```jsx
<motion.div
  initial={{
    left: `${initialPos.x}%`,  // これがないとデフォルト位置から開始
    top: `${initialPos.y}%`,
    opacity: 0,
  }}
  animate={{ ... }}
>
```

### 問題5: スクロールバーがちらつく

**原因**: アニメーション時にコンテンツサイズが変動

**解決**:
- `Tournament.css`: `.tournament-container { overflow: hidden }`
- `index.css`: `body { overflow: hidden }`

## コーディングパターン

### プレート移動の実装

```javascript
// App.jsx
const advanceToBracket = (matchId, winnerSlot, loserSlot) => {
  // 1. 履歴に保存
  setHistory(prev => [...prev, { /* 現在の状態 */ }])

  // 2. 試合結果を記録
  setMatchResults(prev => ({
    ...prev,
    [matchId]: { winner: winnerSlot, loser: loserSlot }
  }))

  // 3. 次の位置を取得（中心座標）
  const nextPos = getNextPosition(matchId)

  // 4. 中心→左上変換
  const leftTopX = nextPos.x - (SLOT_WIDTH / 2)
  const leftTopY = nextPos.y - (SLOT_HEIGHT / 2)

  // 5. 位置を更新
  setPlayerPositions(prev =>
    prev.map(p =>
      p.slot === winnerSlot ? { ...p, x: leftTopX, y: leftTopY } : p
    )
  )
}
```

### 経路の追加

1. **座標を測定**: `DEBUG_COORDINATE_PICKER = true`で各経由点をクリック
2. **MATCH_PATHSに追加**:
   ```javascript
   export const MATCH_PATHS = {
     // ...
     qf0_slot1: [
       { x: 26.07, y: 12.32 },  // 開始点
       { x: 26.07, y: 16.85 },  // 経由点1
       { x: 34.19, y: 16.85 },  // 経由点2
       { x: 34.19, y: 17.3 },   // 終点
     ],
   }
   ```
3. **判定ロジックを追加** (`getAllWinnerPaths`内):
   ```javascript
   if (matchId === 'qf0') {
     pathKey = result.winner === 1 ? 'qf0_slot1' : 'qf0_slot2'
   }
   ```

### 新しいラウンドの追加

1. **位置定義を追加** (tournamentConfig.js):
   ```javascript
   export const NEW_ROUND_POSITIONS = [
     { x: 50, y: 50, index: 0 },  // 中心座標
   ]
   ```

2. **位置マッピングを追加** (App.jsx):
   ```javascript
   const getNextPosition = (matchId) => {
     const positionMap = {
       // ...
       'newRound': NEW_ROUND_POSITIONS[0],
     }
     return positionMap[matchId]
   }
   ```

3. **対戦ロジックを追加** (Tournament.jsx):
   - `getSlotRound()`: 新ラウンドの位置判定
   - `getOpponent()`: 対戦相手の取得
   - `getMatchInfo()`: 試合ID生成

## ファイル構成

```
tournament-view/
├── src/
│   ├── App.jsx               # メインロジック、状態管理
│   ├── App.css               # UIボタンのスタイル
│   ├── tournamentConfig.js   # 全ての設定（位置、画像パス等）
│   ├── components/
│   │   ├── Tournament.jsx    # トーナメント表示、対戦ロジック
│   │   ├── Tournament.css    # レイアウトスタイル
│   │   └── PlayerSlot.jsx    # プレート表示コンポーネント
│   └── main.jsx
├── public/
│   ├── Tournament_4K.png     # 背景画像
│   ├── iroziro.png           # プレイヤー画像
│   └── ...
├── .github/workflows/
│   └── deploy.yml            # 自動デプロイ設定
├── vite.config.js            # Vite設定（base path）
└── package.json
```

## パフォーマンス最適化

### SVG経路の最適化

viewBox座標系で0-100 x 0-56.25の範囲を使用（アスペクト比16:9）：

```javascript
const createPathString = (waypoints) => {
  const aspectRatio = IMAGE_HEIGHT / IMAGE_WIDTH  // 0.5625
  const convertedWaypoints = waypoints.map(wp => ({
    x: wp.x,
    y: wp.y * aspectRatio  // y座標のみスケーリング
  }))
  // ...
}
```

### LocalStorageの使用

各状態が変更されたときのみ保存：

```javascript
useEffect(() => {
  localStorage.setItem('tournamentPlayers', JSON.stringify(players))
}, [players])  // playersが変更されたときのみ実行
```

## まとめ

### 開発時の注意点
1. **座標は常に中心と左上を意識** - 混同するとバグの原因
2. **経路判定は必ずmatchResultsから** - 位置は動的に変わる
3. **画像パスは必ずBASE_URLを使用** - GitHub Pages対応
4. **Undo前提で設計** - 履歴保存を忘れない
5. **デバッグツールを活用** - 座標測定、HMR

### トラブル時のチェックリスト
- [ ] `tournamentConfig.js`の位置は全て中心座標か
- [ ] 座標比較時に左上→中心変換しているか
- [ ] 画像パスに`import.meta.env.BASE_URL`があるか
- [ ] `motion.div`に`initial`プロパティがあるか
- [ ] `matchResults`で判定しているか（位置ベースではない）

このガイドに従うことで、トーナメントシステムの拡張やバグ修正が容易になります。
