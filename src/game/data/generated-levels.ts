import type { LevelDefinition, Obstacle, Position } from '@/src/game/types';

const COLOR_POOL = ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7', '#f97316', '#06b6d4'];
const LABEL_POOL = ['R', 'G', 'B', 'Y', 'P', 'O', 'C'];

const keyOf = ({ x, y }: Position) => `${x},${y}`;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getCarCountForLevel = (levelNumber: number) => {
  if (levelNumber <= 4) return 2;
  if (levelNumber <= 10) return 3;
  if (levelNumber <= 20) return 4;
  if (levelNumber <= 40) return 5;
  if (levelNumber <= 70) return 6;
  return 7;
};

const getBoardSize = (levelNumber: number, carCount: number) => {
  if (levelNumber <= 5) return { width: 8, height: 6 };
  if (levelNumber <= 10) return { width: 9, height: 7 };
  if (carCount <= 4) return { width: 10, height: 8 };
  if (carCount <= 5) return { width: 11, height: 9 };
  return { width: 12, height: 10 };
};

const getDifficultyLabel = (levelNumber: number) => {
  if (levelNumber <= 5) return 'Tutorial Streets';
  if (levelNumber <= 10) return 'Early Pressure';
  if (levelNumber <= 20) return 'Trap District';
  if (levelNumber <= 40) return 'Gridlock Core';
  if (levelNumber <= 70) return 'Deadlock Sector';
  return 'No-Mistake Zone';
};

const carveLine = (open: Set<string>, from: Position, to: Position, width: number, height: number) => {
  let x = from.x;
  let y = from.y;
  const dx = Math.sign(to.x - from.x);
  const dy = Math.sign(to.y - from.y);

  const add = (px: number, py: number) => {
    if (px >= 0 && px < width && py >= 0 && py < height) {
      open.add(`${px},${py}`);
    }
  };

  add(x, y);
  while (x !== to.x) {
    x += dx;
    add(x, y);
  }
  while (y !== to.y) {
    y += dy;
    add(x, y);
  }
};

const carvePath = (open: Set<string>, points: Position[], width: number, height: number) => {
  for (let i = 0; i < points.length - 1; i += 1) {
    carveLine(open, points[i], points[i + 1], width, height);
  }
};

const getStartRows = (height: number, carCount: number) => {
  const rows = [
    Math.floor(height / 2),
    Math.floor(height / 2) - 1,
    Math.floor(height / 2) + 1,
    Math.floor(height / 2) - 2,
    Math.floor(height / 2) + 2,
    1,
    height - 2,
  ];

  return rows.map((row) => clamp(row, 1, height - 2)).slice(0, carCount);
};

const getSpine = (levelNumber: number, width: number, height: number): Position[] => {
  const laneTop = 1;
  const laneBottom = height - 2;
  const midY = Math.floor(height / 2);
  const variant = (levelNumber - 1) % 8;

  switch (variant) {
    case 0:
      return [
        { x: 1, y: midY },
        { x: 3, y: midY },
        { x: 3, y: laneTop },
        { x: width - 3, y: laneTop },
        { x: width - 3, y: laneBottom },
      ];
    case 1:
      return [
        { x: 1, y: midY },
        { x: 4, y: midY },
        { x: 4, y: laneBottom },
        { x: width - 4, y: laneBottom },
        { x: width - 4, y: laneTop },
      ];
    case 2:
      return [
        { x: 1, y: midY },
        { x: 2, y: midY },
        { x: 2, y: laneTop },
        { x: width - 5, y: laneTop },
        { x: width - 5, y: midY },
        { x: width - 3, y: midY },
        { x: width - 3, y: laneBottom },
      ];
    case 3:
      return [
        { x: 1, y: midY },
        { x: 3, y: midY },
        { x: 3, y: laneBottom },
        { x: width - 5, y: laneBottom },
        { x: width - 5, y: laneTop },
        { x: width - 3, y: laneTop },
      ];
    case 4:
      return [
        { x: 1, y: midY },
        { x: 2, y: midY },
        { x: 2, y: laneBottom },
        { x: width - 4, y: laneBottom },
        { x: width - 4, y: midY },
        { x: width - 3, y: midY },
        { x: width - 3, y: laneTop },
      ];
    case 5:
      return [
        { x: 1, y: midY },
        { x: 4, y: midY },
        { x: 4, y: laneTop },
        { x: width - 3, y: laneTop },
        { x: width - 3, y: midY },
        { x: width - 5, y: midY },
        { x: width - 5, y: laneBottom },
      ];
    case 6:
      return [
        { x: 1, y: midY },
        { x: 3, y: midY },
        { x: 3, y: laneTop },
        { x: width - 6, y: laneTop },
        { x: width - 6, y: laneBottom },
        { x: width - 3, y: laneBottom },
      ];
    case 7:
    default:
      return [
        { x: 1, y: midY },
        { x: 2, y: midY },
        { x: 2, y: laneTop },
        { x: width - 4, y: laneTop },
        { x: width - 4, y: laneBottom },
        { x: width - 3, y: laneBottom },
        { x: width - 3, y: midY },
      ];
  }
};

const makeOpenCells = ({
  levelNumber,
  width,
  height,
  carRows,
  parkingRows,
}: {
  levelNumber: number;
  width: number;
  height: number;
  carRows: number[];
  parkingRows: number[];
}) => {
  const open = new Set<string>();
  const spine = getSpine(levelNumber, width, height);
  carvePath(open, spine, width, height);

  const pressure = Math.max(0, levelNumber - 1);
  const mergeX = levelNumber <= 5 ? 2 : levelNumber <= 10 ? 3 : clamp(4 + Math.floor(pressure / 20), 4, width - 4);
  const preParkX = clamp(width - 4 - Math.floor(pressure / 22), Math.floor(width / 2), width - 4);
  const parkX = width - 2;

  for (let i = 0; i < carRows.length; i += 1) {
    const startRow = carRows[i];
    const targetRow = parkingRows[i];

    carvePath(
      open,
      [
        { x: 0, y: startRow },
        { x: 1, y: startRow },
        { x: 1, y: Math.floor(height / 2) },
        { x: mergeX, y: Math.floor(height / 2) },
        { x: mergeX, y: targetRow },
        { x: preParkX, y: targetRow },
        { x: parkX, y: targetRow },
      ],
      width,
      height,
    );

    if (levelNumber >= 6) {
      const detourX = clamp(2 + ((levelNumber + i) % Math.max(3, width - 6)), 2, width - 4);
      carvePath(open, [{ x: detourX, y: targetRow }, { x: detourX, y: clamp(targetRow + (i % 2 === 0 ? -1 : 1), 1, height - 2) }], width, height);
    }
  }

  const trapDensity =
    levelNumber <= 5 ? 0 : levelNumber <= 10 ? 2 : 3 + Math.floor((levelNumber - 10) / 8);

  for (let t = 0; t < trapDensity; t += 1) {
    const baseX = clamp(2 + ((levelNumber * 3 + t * 2) % Math.max(2, width - 5)), 2, width - 4);
    const baseY = clamp(1 + ((levelNumber + t * 3) % Math.max(2, height - 2)), 1, height - 2);
    const length = 1 + ((levelNumber + t) % 2);
    const direction = (levelNumber + t) % 2 === 0 ? -1 : 1;

    carveLine(open, { x: baseX, y: baseY }, { x: baseX + length * direction, y: baseY }, width, height);
  }

  if (levelNumber >= 10) {
    const chokeX = clamp(Math.floor(width / 2) + Math.floor((levelNumber - 10) / 12), 3, width - 4);
    carveLine(open, { x: chokeX, y: 1 }, { x: chokeX, y: height - 2 }, width, height);
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

const getParkingRows = (levelNumber: number, carRows: number[], height: number) => {
  if (levelNumber <= 5) {
    return [...carRows].reverse();
  }

  const rows = [...carRows];
  const shift = levelNumber <= 10 ? 1 : Math.min(rows.length - 1, 1 + Math.floor((levelNumber - 10) / 15));
  const rotated = rows.map((_, i) => rows[(i + shift) % rows.length]);

  if (levelNumber >= 10 && rotated.length > 2) {
    rotated[0] = clamp(rotated[0] + 1, 1, height - 2);
    rotated[rotated.length - 1] = clamp(rotated[rotated.length - 1] - 1, 1, height - 2);
  }

  return rotated;
};

const getParkingX = (levelNumber: number, carIndex: number, width: number) => {
  if (levelNumber <= 4) return width - 2;
  if (levelNumber <= 10) return width - 2 - (carIndex % 2);

  const inwardShift = clamp(1 + Math.floor((levelNumber - 10) / 18), 1, 3);
  return clamp(width - 2 - ((carIndex + levelNumber) % 2) * inwardShift, Math.floor(width / 2), width - 2);
};

const buildLevel = (levelNumber: number): LevelDefinition => {
  const carCount = getCarCountForLevel(levelNumber);
  const boardSize = getBoardSize(levelNumber, carCount);
  const carRows = getStartRows(boardSize.height, carCount);
  const parkingRows = getParkingRows(levelNumber, carRows, boardSize.height);

  const openCells = makeOpenCells({
    levelNumber,
    width: boardSize.width,
    height: boardSize.height,
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
    position: { x: getParkingX(levelNumber, i, boardSize.width), y: parkingRows[i] },
    color: COLOR_POOL[i],
    acceptsCarId: `car-${i + 1}`,
  }));

  return {
    id: `level-${String(levelNumber).padStart(3, '0')}`,
    name: `Level ${levelNumber} - ${getDifficultyLabel(levelNumber)}`,
    boardSize,
    cars,
    parkingSpots,
    obstacles: makeObstacles({ width: boardSize.width, height: boardSize.height, openCells }),
  };
};

const isInside = (width: number, height: number, p: Position) => p.x >= 0 && p.y >= 0 && p.x < width && p.y < height;

const hasPath = ({
  width,
  height,
  start,
  goal,
  blocked,
}: {
  width: number;
  height: number;
  start: Position;
  goal: Position;
  blocked: Set<string>;
}) => {
  const queue: Position[] = [start];
  const seen = new Set<string>([keyOf(start)]);

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.x === goal.x && current.y === goal.y) {
      return true;
    }

    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 },
    ];

    for (const next of neighbors) {
      const k = keyOf(next);
      if (!isInside(width, height, next) || blocked.has(k) || seen.has(k)) {
        continue;
      }

      seen.add(k);
      queue.push(next);
    }
  }

  return false;
};

const hasWinningOrder = (level: LevelDefinition) => {
  const allMask = (1 << level.cars.length) - 1;
  const obstacleSet = new Set(level.obstacles.map((o) => keyOf(o.position)));
  const carByIndex = level.cars;
  const spotByCarId = new Map(level.parkingSpots.map((spot) => [spot.acceptsCarId, spot.position]));

  const canParkWithMask = (index: number, mask: number) => {
    const car = carByIndex[index];
    const spot = spotByCarId.get(car.id);
    if (!spot) return false;

    const blocked = new Set<string>(obstacleSet);

    for (let i = 0; i < carByIndex.length; i += 1) {
      const otherCar = carByIndex[i];
      if (otherCar.id === car.id) continue;

      const isParked = (mask & (1 << i)) !== 0;
      blocked.add(
        isParked ? keyOf(spotByCarId.get(otherCar.id) ?? otherCar.position) : keyOf(otherCar.position),
      );
    }

    return hasPath({
      width: level.boardSize.width,
      height: level.boardSize.height,
      start: car.position,
      goal: spot,
      blocked,
    });
  };

  const dfs = (mask: number, visiting: Set<number>): boolean => {
    if (mask === allMask) return true;
    if (visiting.has(mask)) return false;

    visiting.add(mask);

    for (let i = 0; i < carByIndex.length; i += 1) {
      if ((mask & (1 << i)) !== 0) {
        continue;
      }

      if (canParkWithMask(i, mask) && dfs(mask | (1 << i), visiting)) {
        return true;
      }
    }

    return false;
  };

  return dfs(0, new Set<number>());
};

export const GENERATED_LEVELS: LevelDefinition[] = Array.from({ length: 99 }, (_, index) => buildLevel(index + 1));

if (GENERATED_LEVELS.length !== 99) {
  throw new Error('Crash Car Escape requires exactly 99 levels.');
}

for (const level of GENERATED_LEVELS) {
  const occupied = new Set<string>();

  for (const car of level.cars) {
    occupied.add(keyOf(car.position));
  }

  for (const spot of level.parkingSpots) {
    const k = keyOf(spot.position);

    if (occupied.has(k)) {
      throw new Error(`Invalid level: overlapping start + parking tile (${level.id}, ${k})`);
    }

    occupied.add(k);
  }

  if (!hasWinningOrder(level)) {
    throw new Error(`Invalid level: no winning order exists (${level.id})`);
  }
}
