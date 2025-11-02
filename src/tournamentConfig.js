// Tournament bracket positions based on background image
export const SLOT_POSITIONS = [
  // Left side - Top bracket (QF Match 0)
  { x: 40, y: 495, slot: 0, isInput: true },
  { x: 40, y: 690, slot: 1, isInput: true },

  // Left side - Seeded player (SF slot)
  { x: 40, y: 888, slot: 2, isInput: true },

  // Left side - Bottom bracket (QF Match 1)
  { x: 40, y: 1175, slot: 3, isInput: true },
  { x: 40, y: 1373, slot: 4, isInput: true },

  // Left side - Seeded player (SF slot)
  { x: 40, y: 1570, slot: 5, isInput: true },

  // Right side - Top bracket (QF Match 2)
  { x: 913, y: 495, slot: 6, isInput: true },
  { x: 913, y: 690, slot: 7, isInput: true },

  // Right side - Seeded player (SF slot)
  { x: 913, y: 888, slot: 8, isInput: true },

  // Right side - Bottom bracket (QF Match 3)
  { x: 913, y: 1175, slot: 9, isInput: true },
  { x: 913, y: 1373, slot: 10, isInput: true },

  // Right side - Seeded player (SF slot)
  { x: 913, y: 1570, slot: 11, isInput: true }
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

// QF Winners display positions (between Round 1 and seeded players)
export const QF_WINNER_POSITIONS = [
  { x: 220, y: 790, index: 0 },  // QF0 winner (slots 1,2) → faces slot 0
  { x: 220, y: 1274, index: 1 }, // QF1 winner (slots 3,4) → faces slot 5
  { x: 730, y: 790, index: 2 },  // QF2 winner (slots 7,8) → faces slot 6
  { x: 730, y: 1274, index: 3 }, // QF3 winner (slots 9,10) → faces slot 11
];

// SF Winners display positions (after Round 2)
export const SF_WINNER_POSITIONS = [
  { x: 275, y: 600, index: 0 },  // SF0 winner (qfWinner[0] vs slot 0)
  { x: 275, y: 1462, index: 1 }, // SF1 winner (qfWinner[1] vs slot 5)
  { x: 675, y: 600, index: 2 },  // SF2 winner (qfWinner[2] vs slot 6)
  { x: 675, y: 1462, index: 3 }, // SF3 winner (qfWinner[3] vs slot 11)
];

// Final Players display positions (決勝戦)
export const FINAL_PLAYER_POSITIONS = [
  { x: 325, y: 1025, index: 0 },  // Final player 0 (left semifinal winner)
  { x: 700, y: 1025, index: 1 },  // Final player 1 (right semifinal winner)
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

// Background image dimensions (display size when coordinates were measured)
export const IMAGE_WIDTH = 1260;
export const IMAGE_HEIGHT = 1800;

// Slot dimensions (approximate size of red boxes in image)
export const SLOT_WIDTH = 310;
export const SLOT_HEIGHT = 75;

// Trophy image path (set to null to use default emoji 🏆)
export const TROPHY_IMAGE = null; // Example: '/trophy.png'
