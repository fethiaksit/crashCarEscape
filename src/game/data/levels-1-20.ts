export type Car = {
  id: string;
  x: number;
  y: number;
  color: string;
};

export type Parking = {
  x: number;
  y: number;
  color: string;
};

export type Level = {
  cars: Car[];
  parkings: Parking[];
  walls: { x: number; y: number }[];
};

export const LEVELS_1_20: Level[] = [
  // 1) 6x6 - tutorial gate
  {
    cars: [
      { id: 'R1', x: 0, y: 2, color: '#ef4444' },
      { id: 'B1', x: 2, y: 2, color: '#3b82f6' },
    ],
    parkings: [
      { x: 5, y: 2, color: '#ef4444' },
      { x: 3, y: 0, color: '#3b82f6' },
    ],
    walls: [{ x: 1, y: 1 }, { x: 1, y: 3 }, { x: 4, y: 1 }],
  },
  // 2) 6x6 - side pocket teaching
  {
    cars: [
      { id: 'G2', x: 0, y: 1, color: '#22c55e' },
      { id: 'Y2', x: 2, y: 1, color: '#eab308' },
      { id: 'R2', x: 1, y: 4, color: '#ef4444' },
    ],
    parkings: [
      { x: 5, y: 1, color: '#22c55e' },
      { x: 2, y: 5, color: '#eab308' },
      { x: 5, y: 4, color: '#ef4444' },
    ],
    walls: [{ x: 3, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 3 }],
  },
  // 3) 6x6 - one-lane center
  {
    cars: [
      { id: 'B3', x: 0, y: 3, color: '#3b82f6' },
      { id: 'P3', x: 2, y: 3, color: '#a855f7' },
      { id: 'G3', x: 5, y: 0, color: '#22c55e' },
    ],
    parkings: [
      { x: 5, y: 3, color: '#3b82f6' },
      { x: 1, y: 5, color: '#a855f7' },
      { x: 3, y: 0, color: '#22c55e' },
    ],
    walls: [{ x: 1, y: 2 }, { x: 1, y: 4 }, { x: 4, y: 2 }, { x: 4, y: 4 }],
  },
  // 4) 6x6 - shallow zig pocket
  {
    cars: [
      { id: 'R4', x: 0, y: 0, color: '#ef4444' },
      { id: 'C4', x: 1, y: 0, color: '#06b6d4' },
      { id: 'Y4', x: 4, y: 3, color: '#eab308' },
    ],
    parkings: [
      { x: 5, y: 0, color: '#ef4444' },
      { x: 2, y: 4, color: '#06b6d4' },
      { x: 5, y: 5, color: '#eab308' },
    ],
    walls: [{ x: 2, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 2, y: 3 }],
  },
  // 5) 7x7 - open with single blocker
  {
    cars: [
      { id: 'G5', x: 0, y: 3, color: '#22c55e' },
      { id: 'O5', x: 3, y: 3, color: '#f97316' },
      { id: 'B5', x: 1, y: 6, color: '#3b82f6' },
    ],
    parkings: [
      { x: 6, y: 3, color: '#22c55e' },
      { x: 5, y: 0, color: '#f97316' },
      { x: 6, y: 6, color: '#3b82f6' },
    ],
    walls: [{ x: 2, y: 2 }, { x: 2, y: 4 }, { x: 4, y: 2 }, { x: 4, y: 4 }],
  },
  // 6) 7x7 - bent lane
  {
    cars: [
      { id: 'P6', x: 0, y: 5, color: '#a855f7' },
      { id: 'R6', x: 2, y: 5, color: '#ef4444' },
      { id: 'G6', x: 4, y: 1, color: '#22c55e' },
      { id: 'Y6', x: 6, y: 6, color: '#eab308' },
    ],
    parkings: [
      { x: 6, y: 5, color: '#a855f7' },
      { x: 0, y: 0, color: '#ef4444' },
      { x: 6, y: 1, color: '#22c55e' },
      { x: 3, y: 6, color: '#eab308' },
    ],
    walls: [{ x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 3, y: 3 }, { x: 5, y: 2 }],
  },
  // 7) 7x7 - C corridor
  {
    cars: [
      { id: 'C7', x: 0, y: 2, color: '#06b6d4' },
      { id: 'B7', x: 2, y: 2, color: '#3b82f6' },
      { id: 'O7', x: 5, y: 6, color: '#f97316' },
    ],
    parkings: [
      { x: 6, y: 2, color: '#06b6d4' },
      { x: 0, y: 6, color: '#3b82f6' },
      { x: 6, y: 6, color: '#f97316' },
    ],
    walls: [{ x: 1, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }],
  },
  // 8) 7x7 - split plaza
  {
    cars: [
      { id: 'Y8', x: 0, y: 1, color: '#eab308' },
      { id: 'G8', x: 2, y: 1, color: '#22c55e' },
      { id: 'R8', x: 4, y: 5, color: '#ef4444' },
      { id: 'P8', x: 1, y: 6, color: '#a855f7' },
    ],
    parkings: [
      { x: 6, y: 1, color: '#eab308' },
      { x: 3, y: 6, color: '#22c55e' },
      { x: 6, y: 5, color: '#ef4444' },
      { x: 0, y: 6, color: '#a855f7' },
    ],
    walls: [{ x: 3, y: 2 }, { x: 3, y: 3 }, { x: 2, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 4 }],
  },
  // 9) 8x8 - long hallway intro
  {
    cars: [
      { id: 'B9', x: 0, y: 4, color: '#3b82f6' },
      { id: 'R9', x: 2, y: 4, color: '#ef4444' },
      { id: 'G9', x: 4, y: 0, color: '#22c55e' },
      { id: 'O9', x: 7, y: 7, color: '#f97316' },
    ],
    parkings: [
      { x: 7, y: 4, color: '#3b82f6' },
      { x: 1, y: 7, color: '#ef4444' },
      { x: 7, y: 0, color: '#22c55e' },
      { x: 5, y: 7, color: '#f97316' },
    ],
    walls: [{ x: 1, y: 3 }, { x: 1, y: 5 }, { x: 3, y: 3 }, { x: 3, y: 5 }, { x: 5, y: 2 }, { x: 6, y: 2 }],
  },
  // 10) 8x8 - easy order lock
  {
    cars: [
      { id: 'C10', x: 0, y: 2, color: '#06b6d4' },
      { id: 'Y10', x: 2, y: 2, color: '#eab308' },
      { id: 'P10', x: 4, y: 6, color: '#a855f7' },
      { id: 'G10', x: 6, y: 1, color: '#22c55e' },
    ],
    parkings: [
      { x: 7, y: 2, color: '#06b6d4' },
      { x: 3, y: 0, color: '#eab308' },
      { x: 7, y: 6, color: '#a855f7' },
      { x: 1, y: 1, color: '#22c55e' },
    ],
    walls: [{ x: 1, y: 1 }, { x: 1, y: 3 }, { x: 3, y: 1 }, { x: 3, y: 3 }, { x: 5, y: 4 }, { x: 5, y: 5 }],
  },
  // 11) 6x6 - first true dependency
  {
    cars: [
      { id: 'R11', x: 0, y: 2, color: '#ef4444' },
      { id: 'B11', x: 2, y: 2, color: '#3b82f6' },
      { id: 'G11', x: 4, y: 1, color: '#22c55e' },
      { id: 'Y11', x: 1, y: 5, color: '#eab308' },
    ],
    parkings: [
      { x: 5, y: 2, color: '#ef4444' },
      { x: 0, y: 0, color: '#3b82f6' },
      { x: 5, y: 0, color: '#22c55e' },
      { x: 4, y: 5, color: '#eab308' },
    ],
    walls: [{ x: 1, y: 1 }, { x: 1, y: 3 }, { x: 3, y: 1 }, { x: 3, y: 3 }, { x: 4, y: 3 }],
  },
  // 12) 6x6 - corner squeeze
  {
    cars: [
      { id: 'G12', x: 0, y: 4, color: '#22c55e' },
      { id: 'P12', x: 2, y: 4, color: '#a855f7' },
      { id: 'R12', x: 3, y: 0, color: '#ef4444' },
      { id: 'C12', x: 5, y: 5, color: '#06b6d4' },
    ],
    parkings: [
      { x: 5, y: 4, color: '#22c55e' },
      { x: 1, y: 0, color: '#a855f7' },
      { x: 5, y: 0, color: '#ef4444' },
      { x: 0, y: 5, color: '#06b6d4' },
    ],
    walls: [{ x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 2 }, { x: 4, y: 1 }],
  },
  // 13) 7x7 - offset tunnel
  {
    cars: [
      { id: 'O13', x: 0, y: 3, color: '#f97316' },
      { id: 'B13', x: 2, y: 3, color: '#3b82f6' },
      { id: 'Y13', x: 4, y: 1, color: '#eab308' },
      { id: 'R13', x: 6, y: 5, color: '#ef4444' },
    ],
    parkings: [
      { x: 6, y: 3, color: '#f97316' },
      { x: 0, y: 0, color: '#3b82f6' },
      { x: 6, y: 0, color: '#eab308' },
      { x: 1, y: 5, color: '#ef4444' },
    ],
    walls: [{ x: 1, y: 2 }, { x: 1, y: 4 }, { x: 3, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 4 }, { x: 5, y: 3 }],
  },
  // 14) 7x7 - crossbar traffic
  {
    cars: [
      { id: 'C14', x: 0, y: 1, color: '#06b6d4' },
      { id: 'G14', x: 2, y: 1, color: '#22c55e' },
      { id: 'P14', x: 4, y: 4, color: '#a855f7' },
      { id: 'R14', x: 6, y: 6, color: '#ef4444' },
      { id: 'Y14', x: 1, y: 6, color: '#eab308' },
    ],
    parkings: [
      { x: 6, y: 1, color: '#06b6d4' },
      { x: 0, y: 4, color: '#22c55e' },
      { x: 6, y: 4, color: '#a855f7' },
      { x: 3, y: 6, color: '#ef4444' },
      { x: 2, y: 0, color: '#eab308' },
    ],
    walls: [{ x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 2, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 5 }],
  },
  // 15) 7x7 - double pocket
  {
    cars: [
      { id: 'B15', x: 0, y: 5, color: '#3b82f6' },
      { id: 'R15', x: 2, y: 5, color: '#ef4444' },
      { id: 'G15', x: 4, y: 2, color: '#22c55e' },
      { id: 'O15', x: 6, y: 0, color: '#f97316' },
      { id: 'P15', x: 1, y: 0, color: '#a855f7' },
    ],
    parkings: [
      { x: 6, y: 5, color: '#3b82f6' },
      { x: 0, y: 2, color: '#ef4444' },
      { x: 6, y: 2, color: '#22c55e' },
      { x: 3, y: 0, color: '#f97316' },
      { x: 2, y: 6, color: '#a855f7' },
    ],
    walls: [{ x: 1, y: 4 }, { x: 2, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 3, y: 3 }, { x: 3, y: 2 }],
  },
  // 16) 8x8 - staggered barriers
  {
    cars: [
      { id: 'Y16', x: 0, y: 3, color: '#eab308' },
      { id: 'C16', x: 2, y: 3, color: '#06b6d4' },
      { id: 'R16', x: 4, y: 6, color: '#ef4444' },
      { id: 'G16', x: 6, y: 2, color: '#22c55e' },
      { id: 'B16', x: 1, y: 7, color: '#3b82f6' },
    ],
    parkings: [
      { x: 7, y: 3, color: '#eab308' },
      { x: 0, y: 0, color: '#06b6d4' },
      { x: 7, y: 6, color: '#ef4444' },
      { x: 3, y: 2, color: '#22c55e' },
      { x: 7, y: 7, color: '#3b82f6' },
    ],
    walls: [{ x: 1, y: 2 }, { x: 1, y: 4 }, { x: 3, y: 1 }, { x: 3, y: 5 }, { x: 5, y: 3 }, { x: 5, y: 4 }, { x: 6, y: 5 }],
  },
  // 17) 8x8 - hook corridor
  {
    cars: [
      { id: 'P17', x: 0, y: 1, color: '#a855f7' },
      { id: 'O17', x: 2, y: 1, color: '#f97316' },
      { id: 'B17', x: 4, y: 4, color: '#3b82f6' },
      { id: 'R17', x: 6, y: 7, color: '#ef4444' },
      { id: 'G17', x: 1, y: 6, color: '#22c55e' },
    ],
    parkings: [
      { x: 7, y: 1, color: '#a855f7' },
      { x: 0, y: 4, color: '#f97316' },
      { x: 7, y: 4, color: '#3b82f6' },
      { x: 3, y: 7, color: '#ef4444' },
      { x: 6, y: 6, color: '#22c55e' },
    ],
    walls: [{ x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 5, y: 5 }, { x: 4, y: 5 }],
  },
  // 18) 8x8 - side maze light
  {
    cars: [
      { id: 'R18', x: 0, y: 5, color: '#ef4444' },
      { id: 'Y18', x: 2, y: 5, color: '#eab308' },
      { id: 'C18', x: 4, y: 1, color: '#06b6d4' },
      { id: 'O18', x: 6, y: 3, color: '#f97316' },
      { id: 'P18', x: 1, y: 0, color: '#a855f7' },
      { id: 'G18', x: 7, y: 7, color: '#22c55e' },
    ],
    parkings: [
      { x: 7, y: 5, color: '#ef4444' },
      { x: 0, y: 2, color: '#eab308' },
      { x: 7, y: 1, color: '#06b6d4' },
      { x: 3, y: 3, color: '#f97316' },
      { x: 2, y: 0, color: '#a855f7' },
      { x: 5, y: 7, color: '#22c55e' },
    ],
    walls: [{ x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 3, y: 5 }, { x: 5, y: 1 }, { x: 5, y: 2 }, { x: 5, y: 6 }],
  },
  // 19) 8x8 - forked lane
  {
    cars: [
      { id: 'B19', x: 0, y: 2, color: '#3b82f6' },
      { id: 'G19', x: 2, y: 2, color: '#22c55e' },
      { id: 'R19', x: 4, y: 5, color: '#ef4444' },
      { id: 'C19', x: 6, y: 0, color: '#06b6d4' },
      { id: 'Y19', x: 1, y: 7, color: '#eab308' },
      { id: 'O19', x: 7, y: 6, color: '#f97316' },
    ],
    parkings: [
      { x: 7, y: 2, color: '#3b82f6' },
      { x: 0, y: 5, color: '#22c55e' },
      { x: 7, y: 5, color: '#ef4444' },
      { x: 2, y: 0, color: '#06b6d4' },
      { x: 3, y: 7, color: '#eab308' },
      { x: 5, y: 6, color: '#f97316' },
    ],
    walls: [{ x: 1, y: 1 }, { x: 1, y: 3 }, { x: 3, y: 1 }, { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 4 }],
  },
  // 20) 8x8 - light multi-step planner
  {
    cars: [
      { id: 'G20', x: 0, y: 6, color: '#22c55e' },
      { id: 'R20', x: 2, y: 6, color: '#ef4444' },
      { id: 'B20', x: 4, y: 2, color: '#3b82f6' },
      { id: 'Y20', x: 6, y: 4, color: '#eab308' },
      { id: 'P20', x: 1, y: 1, color: '#a855f7' },
      { id: 'C20', x: 7, y: 0, color: '#06b6d4' },
    ],
    parkings: [
      { x: 7, y: 6, color: '#22c55e' },
      { x: 0, y: 2, color: '#ef4444' },
      { x: 7, y: 2, color: '#3b82f6' },
      { x: 3, y: 4, color: '#eab308' },
      { x: 2, y: 1, color: '#a855f7' },
      { x: 5, y: 0, color: '#06b6d4' },
    ],
    walls: [{ x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 3, y: 6 }, { x: 5, y: 2 }, { x: 5, y: 3 }, { x: 6, y: 1 }],
  },
];
