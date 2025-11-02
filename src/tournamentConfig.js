// Tournament bracket positions based on background image
export const SLOT_POSITIONS = [
  // Left side - Top bracket (QF Match 0)
  { x: 40, y: 495, slot: 0, isInput: true },
  { x: 40, y: 690, slot: 1, isInput: true },

  // Left side - Top winner slot (SF slot)
  { x: 40, y: 888, slot: 2, isInput: false },

  // Left side - Bottom bracket (QF Match 1)
  { x: 40, y: 1175, slot: 3, isInput: true },
  { x: 40, y: 1373, slot: 4, isInput: true },

  // Left side - Bottom winner slot (SF slot)
  { x: 40, y: 1570, slot: 5, isInput: false },

  // Right side - Top bracket (QF Match 2)
  { x: 913, y: 495, slot: 6, isInput: true },
  { x: 913, y: 690, slot: 7, isInput: true },

  // Right side - Top winner slot (SF slot)
  { x: 913, y: 888, slot: 8, isInput: false },

  // Right side - Bottom bracket (QF Match 3)
  { x: 913, y: 1175, slot: 9, isInput: true },
  { x: 913, y: 1373, slot: 10, isInput: true },

  // Right side - Bottom winner slot (SF slot)
  { x: 913, y: 1570, slot: 11, isInput: false }
];

// Match structure: which slots compete, and where winner goes
export const MATCHES = {
  // Quarter Finals
  qf0: { players: [0, 1], winnerSlot: 2 },
  qf1: { players: [3, 4], winnerSlot: 5 },
  qf2: { players: [6, 7], winnerSlot: 8 },
  qf3: { players: [9, 10], winnerSlot: 11 },

  // Semi Finals
  sf0: { players: [2, 5], winnerSlot: 'final0' },
  sf1: { players: [8, 11], winnerSlot: 'final1' },
};

// Background image dimensions (display size when coordinates were measured)
export const IMAGE_WIDTH = 1260;
export const IMAGE_HEIGHT = 1800;

// Slot dimensions (approximate size of red boxes in image)
export const SLOT_WIDTH = 310;
export const SLOT_HEIGHT = 75;
