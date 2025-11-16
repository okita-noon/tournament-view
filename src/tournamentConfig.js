// Debug settings
export const DEBUG_SHOW_CENTER_MARKERS = false // 中心点マーカーを表示
export const DEBUG_COORDINATE_PICKER = false // クリックで座標を取得

// Background image dimensions (display size when coordinates were measured)
export const IMAGE_WIDTH = 3840
export const IMAGE_HEIGHT = 2160

// Slot dimensions (in percentage of image)
// 画像のアスペクト比: 1128 x 274 = 4.116:1
export const SLOT_WIDTH = 28.5 // この値を変更すると高さも自動調整
export const SLOT_HEIGHT = SLOT_WIDTH / 4.1 // 自動計算

// Slot spacing (スロット間の間隔を含めた幅)
const SLOT_SPACING = SLOT_WIDTH * 0.552 // 1.0 = ギャップなし, 1.1 = 10%のギャップ, など

// Base positions for top and bottom rows (左端の位置のみ変更)
const TOP_ROW_START_X = -3.75
const TOP_ROW_Y = 5.45
const BOTTOM_ROW_START_X = -3.75
const BOTTOM_ROW_Y = 72.2

// Tournament bracket positions based on background image (in percentage)
export const SLOT_POSITIONS = [
  // Top row - left to right (各スロット間の差分 = SLOT_SPACING)
  { x: TOP_ROW_START_X, y: TOP_ROW_Y, slot: 0, isInput: true },
  { x: TOP_ROW_START_X + SLOT_SPACING, y: TOP_ROW_Y, slot: 1, isInput: true },
  {
    x: TOP_ROW_START_X + SLOT_SPACING * 2,
    y: TOP_ROW_Y,
    slot: 2,
    isInput: true,
  },
  {
    x: TOP_ROW_START_X + SLOT_SPACING * 3,
    y: TOP_ROW_Y,
    slot: 3,
    isInput: true,
  },
  {
    x: TOP_ROW_START_X + SLOT_SPACING * 4,
    y: TOP_ROW_Y,
    slot: 4,
    isInput: true,
  },
  {
    x: TOP_ROW_START_X + SLOT_SPACING * 5,
    y: TOP_ROW_Y,
    slot: 5,
    isInput: true,
  },

  // Bottom row - left to right (各スロット間の差分 = SLOT_SPACING)
  { x: BOTTOM_ROW_START_X, y: BOTTOM_ROW_Y, slot: 6, isInput: true },
  {
    x: BOTTOM_ROW_START_X + SLOT_SPACING,
    y: BOTTOM_ROW_Y,
    slot: 7,
    isInput: true,
  },
  {
    x: BOTTOM_ROW_START_X + SLOT_SPACING * 2,
    y: BOTTOM_ROW_Y,
    slot: 8,
    isInput: true,
  },
  {
    x: BOTTOM_ROW_START_X + SLOT_SPACING * 3,
    y: BOTTOM_ROW_Y,
    slot: 9,
    isInput: true,
  },
  {
    x: BOTTOM_ROW_START_X + SLOT_SPACING * 4,
    y: BOTTOM_ROW_Y,
    slot: 10,
    isInput: true,
  },
  {
    x: BOTTOM_ROW_START_X + SLOT_SPACING * 5,
    y: BOTTOM_ROW_Y,
    slot: 11,
    isInput: true,
  },
]

// Match structure: which slots compete, and where winner goes to next bracket
export const MATCHES = {
  // Quarter Finals
  qf0: { players: [1, 2], bracketSlot: 0 },
  qf1: { players: [3, 4], bracketSlot: 5 },
  qf2: { players: [7, 8], bracketSlot: 6 },
  qf3: { players: [9, 10], bracketSlot: 11 },

  // Semi Finals (QF winner vs Seed)
  sf0: { players: [0, 'qfWinner0'], bracketSlot: 'final0' },
  sf1: { players: [5, 'qfWinner1'], bracketSlot: 'final0' },
  sf2: { players: [6, 'qfWinner2'], bracketSlot: 'final1' },
  sf3: { players: [11, 'qfWinner3'], bracketSlot: 'final1' },
}

// QF Winners display positions (between Round 1 and seeded players) (in percentage)
export const QF_WINNER_POSITIONS = [
  { x: 34, y: 21.5, index: 0 }, // QF0 winner
  { x: 65, y: 21.5, index: 1 }, // QF1 winner
  { x: 34, y: 62.8, index: 2 }, // QF2 winner
  { x: 65, y: 62.8, index: 3 }, // QF3 winner
]

// SF Winners display positions (after Round 2) (in percentage)
export const SF_WINNER_POSITIONS = [
  { x: 22.6, y: 28.4, index: 0 }, // SF0 winner
  { x: 77.392, y: 28.4, index: 1 }, // SF1 winner
  { x: 22.6, y: 56, index: 2 }, // SF2 winner
  { x: 77.392, y: 56, index: 3 }, // SF3 winner
]

// Final Players display positions (決勝戦) (in percentage)
export const FINAL_PLAYER_POSITIONS = [
  { x: 50, y: 30.5, index: 0 }, // Final player 0
  { x: 50, y: 52.5, index: 1 }, // Final player 1
]

// Champion position (優勝者の位置) (in percentage)
export const CHAMPION_POSITION = { x: 68, y: 41 }

// Winner paths - coordinates for animated lines when players advance (in percentage)
export const MATCH_PATHS = {
  // Quarter Finals
  qf0_slot1: [
    { x: 26.07, y: 12.32 },
    { x: 26.07, y: 16.85 },
    { x: 34.19, y: 16.85 },
    { x: 34.19, y: 17.5 },
  ],
  qf0_slot2: [
    { x: 41.89, y: 12.43 },
    { x: 41.89, y: 16.75 },
    { x: 34.25, y: 16.75 },
    { x: 34.25, y: 17.5 },
  ],
  qf1_slot3: [
    { x: 57.82, y: 12.22 },
    { x: 57.82, y: 16.85 },
    { x: 65.53, y: 16.85 },
    { x: 65.53, y: 17.5 },
  ],
  qf1_slot4: [
    { x: 73.7, y: 12.22 },
    { x: 73.7, y: 16.75 },
    { x: 65.53, y: 16.75 },
    { x: 65.53, y: 17.5 },
  ],
  qf2_slot7: [
    { x: 26.02, y: 72.08 },
    { x: 26.02, y: 67.45 },
    { x: 34.19, y: 67.45 },
    { x: 34.19, y: 66.9 },
  ],
  qf2_slot8: [
    { x: 41.89, y: 72.05 },
    { x: 41.89, y: 67.31 },
    { x: 34.19, y: 67.31 },
    { x: 34.19, y: 66.9 },
  ],
  qf3_slot9: [
    { x: 57.82, y: 72.27 },
    { x: 57.82, y: 67.32 },
    { x: 65.53, y: 67.32 },
    { x: 65.53, y: 66.9 },
  ],
  qf3_slot10: [
    { x: 73.7, y: 71.98 },
    { x: 73.7, y: 67.46 },
    { x: 65.64, y: 67.46 },
    { x: 65.64, y: 66.9 },
  ],

  // Semi Finals
  sf0_slot0: [
    { x: 10.38, y: 12.32 },
    { x: 10.38, y: 23.17 },
    { x: 22.52, y: 23.17 },
    { x: 22.52, y: 24.3 },
  ],
  sf0_qfWinner0: [
    { x: 34.25, y: 16.85 },
    { x: 34.25, y: 23.27 },
    { x: 22.52, y: 23.27 },
    { x: 22.52, y: 24.3 },
  ],
  sf1_qfWinner1: [
    { x: 65.64, y: 16.85 },
    { x: 65.64, y: 23.27 },
    { x: 77.31, y: 23.27 },
    { x: 77.31, y: 24.3 },
  ],
  sf1_slot5: [
    { x: 89.34, y: 12.53 },
    { x: 89.34, y: 23.27 },
    { x: 77.31, y: 23.427 },
    { x: 77.31, y: 24.3 },
  ],
  sf2_slot6: [
    { x: 10.5, y: 72.06 },
    { x: 10.5, y: 60.9 },
    { x: 22.52, y: 60.9 },
    { x: 22.52, y: 59.9 },
  ],
  sf2_qfWinner2: [
    { x: 34.19, y: 67.34 },
    { x: 34.19, y: 61.02 },
    { x: 22.46, y: 61.02 },
    { x: 22.46, y: 59.9 },
  ],
  sf3_qfWinner3: [
    { x: 65.64, y: 67.37 },
    { x: 65.64, y: 61.05 },
    { x: 77.25, y: 61.05 },
    { x: 77.25, y: 60.0 },
  ],
  sf3_slot11: [
    { x: 89.28, y: 72.03 },
    { x: 89.28, y: 60.97 },
    { x: 77.49, y: 60.97 },
    { x: 77.49, y: 60 },
  ],

  // 準決勝 (Semi-semi finals)
  semi0_sfWinner0: [
    { x: 22.58, y: 23.32 },
    { x: 22.58, y: 29.43 },
    { x: 49.95, y: 29.43 },
  ],
  semi0_sfWinner1: [
    { x: 77.19, y: 23.38 },
    { x: 77.17, y: 29.38 },
    { x: 49.89, y: 29.38 },
  ],
  semi1_sfWinner2: [
    { x: 22.46, y: 60.9 },
    { x: 22.46, y: 54.68 },
    { x: 50.01, y: 54.68 },
  ],
  semi1_sfWinner3: [
    { x: 77.43, y: 60.99 },
    { x: 77.43, y: 54.89 },
    { x: 49.89, y: 54.89 },
  ],

  // 決勝 (Finals)
  final_player0: [
    { x: 49.83, y: 29.39 },
    { x: 49.83, y: 33.08 },
  ],
  final_player1: [
    { x: 49.95, y: 54.65 },
    { x: 49.95, y: 50.96 },
  ],
}

// 選手リスト（プルダウンの選択肢）
export const AVAILABLE_PLAYERS = [
  'iroziro',
  'Malimo',
  'HAL',
  'Menowa*',
  'a_l_p',
  'airi',
  'Beige',
  'Goat',
  'kAtts',
  'Meves',
  'Rai',
  'マワシスギ',
]

// Default player names for initial setup (空の配列 - 入力モードからスタート)
export const DEFAULT_PLAYERS = [
  '', // slot 0 - Seed
  '', // slot 1
  '', // slot 2
  '', // slot 3
  '', // slot 4
  '', // slot 5 - Seed
  '', // slot 6 - Seed
  '', // slot 7
  '', // slot 8
  '', // slot 9
  '', // slot 10
  '', // slot 11 - Seed
]

// Trophy image path (set to null to use default emoji 🏆)
export const TROPHY_IMAGE = null // Example: '/trophy.png'

// Base URL for images (automatically set by Vite)
const BASE_URL = import.meta.env.BASE_URL

// Player name to image mapping (選手名 → 画像パス)
export const PLAYER_NAME_TO_IMAGE = {
  'iroziro': `${BASE_URL}iroziro.png`,
  'Malimo': `${BASE_URL}Malimo.png`,
  'HAL': `${BASE_URL}HAL.png`,
  'a_l_p': `${BASE_URL}ALP.png`,
  'airi': `${BASE_URL}Airi.png`,
  'Beige': `${BASE_URL}Beige.png`,
  'Goat': `${BASE_URL}Goat.png`,
  'kAtts': `${BASE_URL}Katts.png`,
  'Menowa*': `${BASE_URL}Menowa.png`,
  'Meves': `${BASE_URL}Meves.png`,
  'Rai': `${BASE_URL}Rai.png`,
  'マワシスギ': `${BASE_URL}mawashizuki.png`,
}

// Player slot images (set to null to use default HTML/CSS rendering) - 後方互換性のため保持
export const PLAYER_SLOT_IMAGES = {
  0: `${BASE_URL}iroziro.png`,
  1: `${BASE_URL}Malimo.png`,
  2: `${BASE_URL}HAL.png`,
  3: `${BASE_URL}ALP.png`,
  4: `${BASE_URL}Airi.png`,
  5: `${BASE_URL}Beige.png`,
  6: `${BASE_URL}Goat.png`,
  7: `${BASE_URL}Katts.png`,
  8: `${BASE_URL}Menowa.png`,
  9: `${BASE_URL}Meves.png`,
  10: `${BASE_URL}Rai.png`,
  11: `${BASE_URL}mawashizuki.png`,
}
