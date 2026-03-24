import type { LevelDefinition, Obstacle, Position } from '@/src/game/types';

const COLOR_POOL = ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7', '#f97316', '#06b6d4'];
const LABEL_POOL = ['R', 'G', 'B', 'Y', 'P', 'O', 'C'];

const pointKey = ({ x, y }: Position) => `${x},${y}`;

const getCarCountForLevel = (levelNumber: number) => {
  if (levelNumber <= 3) return 2;
  if (levelNumber <= 10) return 3;
  if (levelNumber <= 20) return 4;
  if (levelNumber <= 40) return 5;
  if (levelNumber <= 70) return 6;
  return 7;
};

const getBoardSizeForCarCount = (carCount: number) => ({
  width: carCount + 5,
  height: carCount >= 6 ? 9 : carCount >= 4 ? 8 : 7,
});

const getDifficultyLabel = (levelNumber: number) => {
  if (levelNumber <= 3) return 'Intro';
  if (levelNumber <= 10) return 'Thinking Starts';
  if (levelNumber <= 20) return 'Challenging';
  if (levelNumber <= 40) return 'Hard';
  if (levelNumber <= 70) return 'Very Hard';
  return 'Expert';
};

const getStartRows = (height: number) => {
  const mid = Math.floor(height / 2);

  return [mid, mid - 1, mid + 1, mid - 2, mid + 2, 1, height - 2];
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const carveLine = (open: Set<string>, from: Position, to: Position, width: number, height: number) => {
  const dx = Math.sign(to.x - from.x);
  const dy = Math.sign(to.y - from.y);

  let x = from.x;
  let y = from.y;
  open.add(`${x},${y}`);

  while (x !== to.x) {
    x += dx;
    if (x >= 0 && x < width && y >= 0 && y < height) {
      open.add(`${x},${y}`);
    }
  }

  while (y !== to.y) {
    y += dy;
    if (x >= 0 && x < width && y >= 0 && y < height) {
      open.add(`${x},${y}`);
    }
  }
};

const carveRoute = (open: Set<string>, points: Position[], width: number, height: number) => {
  for (let i = 0; i < points.length - 1; i += 1) {
    carveLine(open, points[i], points[i + 1], width, height);
  }
};

const LAYOUT_FAMILIES = [
  'Boulevard Run',
  'North Ring',
  'South Ring',
  'Switchback',
  'Central Hub',
  'Canal Split',
  'Ladder Locks',
  'Perimeter Spiral',
  'Crosswind',
  'Island Hops',
] as const;

const getParkingRows = ({
  familyIndex,
  levelNumber,
  startRows,
}: {
  familyIndex: number;
  levelNumber: number;
  startRows: number[];
}) => {
  const carCount = startRows.length;
  if (carCount === 0) {
    return [];
  }

  const shift = (familyIndex + Math.floor(levelNumber / 9)) % carCount;
  return startRows.map((_, index) => startRows[(index + shift) % carCount]);
};

const getFamilyRoutePoints = ({
  familyIndex,
  startRow,
  targetRow,
  width,
  height,
  carIndex,
}: {
  familyIndex: number;
  startRow: number;
  targetRow: number;
  width: number;
  height: number;
  carIndex: number;
}) => {
  const midY = Math.floor(height / 2);
  const topY = 1;
  const bottomY = height - 2;
  const rightEntry = Math.max(3, width - 3);
  const parkX = width - 2 - (carIndex % 2);
  const centerX = clamp(Math.floor(width / 2), 2, width - 3);

  const baseStart = { x: 0, y: startRow };
  const firstStep = { x: 1, y: startRow };

  switch (familyIndex) {
    case 0:
      return [baseStart, firstStep, { x: rightEntry, y: startRow }, { x: parkX, y: targetRow }];
    case 1:
      return [
        baseStart,
        firstStep,
        { x: 2, y: topY },
        { x: rightEntry, y: topY },
        { x: rightEntry, y: targetRow },
        { x: parkX, y: targetRow },
      ];
    case 2:
      return [
        baseStart,
        firstStep,
        { x: 2, y: bottomY },
        { x: rightEntry, y: bottomY },
        { x: rightEntry, y: targetRow },
        { x: parkX, y: targetRow },
      ];
    case 3:
      return [
        baseStart,
        firstStep,
        { x: centerX - 1, y: startRow },
        { x: centerX - 1, y: carIndex % 2 === 0 ? topY : bottomY },
        { x: centerX + 1, y: carIndex % 2 === 0 ? topY : bottomY },
        { x: centerX + 1, y: targetRow },
        { x: parkX, y: targetRow },
      ];
    case 4:
      return [
        baseStart,
        firstStep,
        { x: 2, y: midY },
        { x: rightEntry, y: midY },
        { x: rightEntry, y: targetRow },
        { x: parkX, y: targetRow },
      ];
    case 5:
      return [
        baseStart,
        firstStep,
        { x: 3, y: startRow < midY ? topY + 1 : bottomY - 1 },
        { x: centerX, y: startRow < midY ? bottomY - 1 : topY + 1 },
        { x: rightEntry, y: targetRow },
        { x: parkX, y: targetRow },
      ];
    case 6:
      return [
        baseStart,
        firstStep,
        { x: clamp(2 + (carIndex % 3), 2, width - 3), y: startRow },
        { x: clamp(2 + (carIndex % 3), 2, width - 3), y: targetRow },
        { x: rightEntry, y: targetRow },
        { x: parkX, y: targetRow },
      ];
    case 7:
      return [
        baseStart,
        firstStep,
        { x: 2, y: topY },
        { x: rightEntry, y: topY },
        { x: rightEntry, y: bottomY },
        { x: 3, y: bottomY },
        { x: 3, y: targetRow },
        { x: parkX, y: targetRow },
      ];
    case 8:
      return [
        baseStart,
        firstStep,
        { x: centerX, y: startRow },
        { x: centerX, y: targetRow },
        { x: rightEntry, y: targetRow },
        { x: parkX, y: targetRow },
      ];
    case 9:
    default:
      return [
        baseStart,
        firstStep,
        { x: 2 + (carIndex % 2), y: startRow },
        { x: 2 + (carIndex % 2), y: midY },
        { x: rightEntry - 1, y: midY },
        { x: rightEntry - 1, y: targetRow },
        { x: parkX, y: targetRow },
      ];
  }
};

const addFamilyAccentRoutes = ({
  open,
  familyIndex,
  width,
  height,
}: {
  open: Set<string>;
  familyIndex: number;
  width: number;
  height: number;
}) => {
  const midY = Math.floor(height / 2);

  if (familyIndex === 1 || familyIndex === 7) {
    carveRoute(open, [{ x: 2, y: 1 }, { x: 2, y: height - 2 }], width, height);
  }

  if (familyIndex === 2 || familyIndex === 5) {
    carveRoute(open, [{ x: width - 3, y: 1 }, { x: width - 3, y: height - 2 }], width, height);
  }

  if (familyIndex === 4 || familyIndex === 8 || familyIndex === 9) {
    carveRoute(open, [{ x: 1, y: midY }, { x: width - 2, y: midY }], width, height);
  }
};

const makeOpenCells = ({
  width,
  height,
  levelNumber,
  carRows,
  parkingRows,
}: {
  width: number;
  height: number;
  levelNumber: number;
  carRows: number[];
  parkingRows: number[];
}) => {
  const familyIndex = (levelNumber - 1) % LAYOUT_FAMILIES.length;
  const open = new Set<string>();

  carRows.forEach((row, index) => {
    const route = getFamilyRoutePoints({
      familyIndex,
      startRow: row,
      targetRow: parkingRows[index],
      width,
      height,
      carIndex: index,
    });

    carveRoute(open, route, width, height);
  });

  addFamilyAccentRoutes({
    open,
    familyIndex,
    width,
    height,
  });

  return open;
};

const makeObstacles = ({
  width,
  height,
  openCells,
}: {
  width: number;
  height: number;
  openCells: Set<string>;
}): Obstacle[] => {
  const obstacles: Obstacle[] = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!openCells.has(`${x},${y}`)) {
        obstacles.push({
          id: `obs-${x}-${y}`,
          position: { x, y },
        });
      }
    }
  }

  return obstacles;
};

const createLevel = (levelNumber: number): LevelDefinition => {
  const carCount = getCarCountForLevel(levelNumber);
  const boardSize = getBoardSizeForCarCount(carCount);
  const availableRows = getStartRows(boardSize.height);
  const carRows = availableRows.slice(0, carCount);
  const familyIndex = (levelNumber - 1) % LAYOUT_FAMILIES.length;
  const parkingRows = getParkingRows({
    familyIndex,
    levelNumber,
    startRows: carRows,
  });

  const openCells = makeOpenCells({
    width: boardSize.width,
    height: boardSize.height,
    levelNumber,
    carRows,
    parkingRows,
  });

  const cars = Array.from({ length: carCount }, (_, i) => ({
    id: `car-${i + 1}`,
    label: LABEL_POOL[i],
    color: COLOR_POOL[i],
    position: { x: 0, y: carRows[i] },
  }));

  const parkingSpots = Array.from({ length: carCount }, (_, i) => ({
    id: `park-${i + 1}`,
    position: {
      x: boardSize.width - 2 - (i % 2),
      y: parkingRows[i],
    },
    color: COLOR_POOL[i],
    acceptsCarId: `car-${i + 1}`,
  }));

  return {
    id: `level-${String(levelNumber).padStart(3, '0')}`,
    name: `Level ${levelNumber} - ${getDifficultyLabel(levelNumber)} (${LAYOUT_FAMILIES[familyIndex]})`,
    boardSize,
    cars,
    parkingSpots,
    obstacles: makeObstacles({
      width: boardSize.width,
      height: boardSize.height,
      openCells,
    }),
  };
};

export const GENERATED_LEVELS: LevelDefinition[] = Array.from({ length: 99 }, (_, index) =>
  createLevel(index + 1),
);

if (GENERATED_LEVELS.length !== 99) {
  throw new Error('Crash Car Escape requires exactly 99 levels.');
}

for (const level of GENERATED_LEVELS) {
  const occupied = new Set<string>();

  for (const car of level.cars) {
    occupied.add(pointKey(car.position));
  }

  for (const spot of level.parkingSpots) {
    const k = pointKey(spot.position);

    if (occupied.has(k)) {
      throw new Error(`Invalid level: overlapping start + parking tile (${level.id}, ${k})`);
    }

    occupied.add(k);
  }
}
