interface Position {
  x: number;
  y: number;
  offset?: number;
}

interface RunePositions {
  nextRune: Position;
  rune: Position;
}

const runePositions: RunePositions = {
  nextRune: {
    x: 1775,
    y: 200,
    offset: 200,
  },
  rune: {
    x: 1775,
    y: 925,
  },
};

export default runePositions;
