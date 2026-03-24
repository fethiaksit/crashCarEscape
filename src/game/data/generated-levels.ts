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

  return [
    mid,
    mid - 1,
    mid + 1,
    mid - 2,
    mid + 2,
    1,
    height - 2,
  ];
};

const makeOpenCells = ({
  width,
  height,
  levelNumber,
  startRows,
}: {
  width: number;
  height: number;
  levelNumber: number;
  startRows: number[];
}) => {
  const mid = Math.floor(height / 2);
  const open = new Set<string>();
  const add = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) {
      return;
    }

    open.add(`${x},${y}`);
  };

  for (let x = 1; x < width; x += 1) {
    add(x, mid);
  }

  for (let y = 1; y < height - 1; y += 1) {
    add(1, y);
  }

  for (const row of startRows) {
    add(0, row);
    add(1, row);
  }

  const addUpperDetour = levelNumber >= 4;
  const addLowerDetour = levelNumber >= 15;
  const addSecondGate = levelNumber >= 40;
  const addThirdGate = levelNumber >= 70;

  if (addUpperDetour) {
    for (let x = 2; x < width - 2; x += 1) {
      add(x, mid - 1);
    }

    add(2, mid);
    add(width - 3, mid);
  }

  if (addLowerDetour) {
    for (let x = 3; x < width - 1; x += 1) {
      add(x, mid + 1);
    }

    add(3, mid);
    add(width - 2, mid);
  }

  if (addSecondGate) {
    for (let y = mid - 2; y <= mid + 2; y += 1) {
      add(2, y);
    }
  }

  if (addThirdGate) {
    for (let y = 1; y < height - 1; y += 1) {
      add(3, y);
    }

    add(4, mid - 1);
    add(4, mid + 1);
  }

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
  const startRows = getStartRows(boardSize.height);
  const openCells = makeOpenCells({
    width: boardSize.width,
    height: boardSize.height,
    levelNumber,
    startRows,
  });

  const mid = Math.floor(boardSize.height / 2);
  const parkXs = Array.from({ length: carCount }, (_, i) => boardSize.width - 2 - i);

  const cars = Array.from({ length: carCount }, (_, i) => {
    const color = COLOR_POOL[i];
    const label = LABEL_POOL[i];
    const row = startRows[(i + levelNumber) % startRows.length];

    return {
      id: `car-${i + 1}`,
      label,
      color,
      position: { x: 0, y: row },
    };
  });

  const parkingSpots = Array.from({ length: carCount }, (_, i) => {
    const color = COLOR_POOL[i];

    return {
      id: `park-${i + 1}`,
      position: {
        x: parkXs[(i + levelNumber) % parkXs.length],
        y: mid,
      },
      color,
      acceptsCarId: `car-${i + 1}`,
    };
  });

  return {
    id: `level-${String(levelNumber).padStart(3, '0')}`,
    name: `Level ${levelNumber} - ${getDifficultyLabel(levelNumber)}`,
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

// Guard rails for development.
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
