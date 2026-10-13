export const colors = {
  ink: "#382d25",
  paper: "#f5edda",
  cream: "#fff9e9",
  brown: "#74523a",
  green: "#667957",
  greenDark: "#3d513a",
  lime: "#a9bb6b",
  gold: "#e9aa3a",
  red: "#c8553d",
  line: "#4a392d",
  muted: "#9f927e",
  appBackground: "#2e392d",
};

// NEXON Maplestory — the same family the source web app declares on <body>.
// Bold covers the UI's near-universal fontWeight 700/800/900 chunky look;
// Light is for the rare unweighted body copy.
export const fonts = {
  bold: "Maplestory-Bold",
  light: "Maplestory-Light",
};

export const spacing = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
};

export const radii = {
  sm: 8,
  md: 11,
  lg: 15,
  pill: 50,
};

// Shared "chunky pixel-game-button" shadow look — a hard offset, not a blur.
// GameButton bakes this in via borderBottomWidth/borderBottomColor.
export const shadow = {
  offset: 3,
  color: colors.line,
};
