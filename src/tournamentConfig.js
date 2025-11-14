// Background image dimensions (display size when coordinates were measured)
export const IMAGE_WIDTH = 3840;
export const IMAGE_HEIGHT = 2160;

// Slot dimensions (in percentage of image)
// 画像のアスペクト比: 1128 x 274 = 4.116:1
export const SLOT_WIDTH = 28.5; // この値を変更すると高さも自動調整
export const SLOT_HEIGHT = SLOT_WIDTH / 4.1; // 自動計算

// Slot spacing (スロット間の間隔を含めた幅)
const SLOT_SPACING = SLOT_WIDTH * 0.563; // 1.0 = ギャップなし, 1.1 = 10%のギャップ, など

// Base positions for top and bottom rows (左端の位置のみ変更)
const TOP_ROW_START_X = -3.2;
const TOP_ROW_Y = 5.45;
const BOTTOM_ROW_START_X = -3.2;
const BOTTOM_ROW_Y = 72.2;


// Tournament bracket positions based on background image (in percentage)
export const SLOT_POSITIONS = [
  // Top row - left to right (各スロット間の差分 = SLOT_SPACING)
  { x: TOP_ROW_START_X, y: TOP_ROW_Y, slot: 0, isInput: true },
  { x: TOP_ROW_START_X + SLOT_SPACING, y: TOP_ROW_Y, slot: 1, isInput: true },
  { x: TOP_ROW_START_X + SLOT_SPACING * 2, y: TOP_ROW_Y, slot: 2, isInput: true },
  { x: TOP_ROW_START_X + SLOT_SPACING * 3, y: TOP_ROW_Y, slot: 3, isInput: true },
  { x: TOP_ROW_START_X + SLOT_SPACING * 4, y: TOP_ROW_Y, slot: 4, isInput: true },
  { x: TOP_ROW_START_X + SLOT_SPACING * 5, y: TOP_ROW_Y, slot: 5, isInput: true },

  // Bottom row - left to right (各スロット間の差分 = SLOT_SPACING)
  { x: BOTTOM_ROW_START_X, y: BOTTOM_ROW_Y, slot: 6, isInput: true },
  { x: BOTTOM_ROW_START_X + SLOT_SPACING, y: BOTTOM_ROW_Y, slot: 7, isInput: true },
  { x: BOTTOM_ROW_START_X + SLOT_SPACING * 2, y: BOTTOM_ROW_Y, slot: 8, isInput: true },
  { x: BOTTOM_ROW_START_X + SLOT_SPACING * 3, y: BOTTOM_ROW_Y, slot: 9, isInput: true },
  { x: BOTTOM_ROW_START_X + SLOT_SPACING * 4, y: BOTTOM_ROW_Y, slot: 10, isInput: true },
  { x: BOTTOM_ROW_START_X + SLOT_SPACING * 5, y: BOTTOM_ROW_Y, slot: 11, isInput: true }
];

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
};

// QF Winners display positions (between Round 1 and seeded players) (in percentage)
export const QF_WINNER_POSITIONS = [
  { x: 15.104, y: 7.269, index: 0 },   // QF0 winner
  { x: 30.339, y: 7.222, index: 1 },  // QF1 winner
  { x: 15.208, y: 31.620, index: 2 },   // QF2 winner
  { x: 30.443, y: 31.759, index: 3 },  // QF3 winner
];

// SF Winners display positions (after Round 2) (in percentage)
export const SF_WINNER_POSITIONS = [
  { x: 9.323, y: 10.278, index: 0 },   // SF0 winner
  { x: 35.833, y: 10.370, index: 1 },  // SF1 winner
  { x: 8.906, y: 28.565, index: 2 },   // SF2 winner
  { x: 35.469, y: 28.611, index: 3 },  // SF3 winner
];

// Final Players display positions (決勝戦) (in percentage)
export const FINAL_PLAYER_POSITIONS = [
  { x: 22.135, y: 13.102, index: 0 },  // Final player 0
  { x: 22.083, y: 25.602, index: 1 },  // Final player 1
];

// Default player names for initial setup
export const DEFAULT_PLAYERS = [
  'iroziro',  // slot 0 - Seed
  'Malimo',  // slot 1
  'HAL',  // slot 2
  'a_l_p',  // slot 3
  'airi',  // slot 4
  'Beige',  // slot 5 - Seed
  'Goat',  // slot 6 - Seed
  'kAtts',  // slot 7
  'Menowa*',  // slot 8
  'Meves',  // slot 9
  'Rai',  // slot 10
  'マワシスギ',  // slot 11 - Seed
];

// Trophy image path (set to null to use default emoji 🏆)
export const TROPHY_IMAGE = null; // Example: '/trophy.png'

// Player slot images (set to null to use default HTML/CSS rendering)
export const PLAYER_SLOT_IMAGES = {
  0: '/iroziro.png',
  1: '/Malimo.png',
  2: '/HAL.png',
  3: '/ALP.png',
  4: '/Airi.png',
  5: '/Beige.png',
  6: '/Goat.png',
  7: '/Katts.png',
  8: '/Menowa.png',
  9: '/Meves.png',
  10: '/Rai.png',
  11: '/mawashizuki.png',
};
