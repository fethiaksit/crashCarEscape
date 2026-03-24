import type { LevelDefinition, Obstacle, Position } from '@/src/game/types';

const COLORS = {
  red: '#ef4444',
  green: '#22c55e',
  blue: '#3b82f6',
};

const point = (x: number, y: number): Position => ({ x, y });

const makeObstacles = ({
  width,
  height,
  open,
}: {
  width: number;
  height: number;
  open: Position[];
}): Obstacle[] => {
  const openSet = new Set(open.map(({ x, y }) => `${x},${y}`));
  const obstacles: Obstacle[] = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!openSet.has(`${x},${y}`)) {
        obstacles.push({
          id: `obs-${x}-${y}`,
          position: { x, y },
        });
      }
    }
  }

  return obstacles;
};

export const ORDER_DEPENDENT_LEVEL_OVERRIDES: LevelDefinition[] = [
  {
    id: 'level-001',
    name: 'Level 1 - First Choke Point',
    boardSize: { width: 5, height: 5 },
    cars: [
      { id: 'car-red', label: 'R', color: COLORS.red, position: point(0, 2) },
      { id: 'car-green', label: 'G', color: COLORS.green, position: point(2, 4) },
    ],
    obstacles: makeObstacles({
      width: 5,
      height: 5,
      open: [point(0, 2), point(1, 2), point(2, 2), point(3, 2), point(4, 2), point(2, 3), point(2, 4)],
    }),
    parkingSpots: [
      { id: 'park-red', color: COLORS.red, position: point(4, 2), acceptsCarId: 'car-red' },
      { id: 'park-green', color: COLORS.green, position: point(1, 2), acceptsCarId: 'car-green' },
    ],
  },
  {
    id: 'level-002',
    name: 'Level 2 - Central Lock',
    boardSize: { width: 6, height: 6 },
    cars: [
      { id: 'car-red', label: 'R', color: COLORS.red, position: point(0, 2) },
      { id: 'car-green', label: 'G', color: COLORS.green, position: point(2, 5) },
      { id: 'car-blue', label: 'B', color: COLORS.blue, position: point(4, 0) },
    ],
    obstacles: makeObstacles({
      width: 6,
      height: 6,
      open: [
        point(0, 2),
        point(1, 2),
        point(2, 2),
        point(3, 2),
        point(4, 2),
        point(5, 2),
        point(2, 0),
        point(2, 1),
        point(2, 3),
        point(2, 4),
        point(2, 5),
        point(4, 0),
        point(4, 1),
      ],
    }),
    parkingSpots: [
      { id: 'park-red', color: COLORS.red, position: point(5, 2), acceptsCarId: 'car-red' },
      { id: 'park-green', color: COLORS.green, position: point(2, 0), acceptsCarId: 'car-green' },
      { id: 'park-blue', color: COLORS.blue, position: point(2, 2), acceptsCarId: 'car-blue' },
    ],
  },
  {
    id: 'level-003',
    name: 'Level 3 - Two Shared Gates',
    boardSize: { width: 7, height: 6 },
    cars: [
      { id: 'car-red', label: 'R', color: COLORS.red, position: point(0, 2) },
      { id: 'car-green', label: 'G', color: COLORS.green, position: point(3, 5) },
      { id: 'car-cyan', label: 'C', color: '#06b6d4', position: point(6, 2) },
    ],
    obstacles: makeObstacles({
      width: 7,
      height: 6,
      open: [
        point(0, 2),
        point(1, 2),
        point(2, 2),
        point(3, 2),
        point(4, 2),
        point(5, 2),
        point(6, 2),
        point(3, 0),
        point(3, 1),
        point(3, 3),
        point(3, 4),
        point(3, 5),
        point(1, 1),
        point(5, 3),
      ],
    }),
    parkingSpots: [
      { id: 'park-red', color: COLORS.red, position: point(5, 3), acceptsCarId: 'car-red' },
      { id: 'park-green', color: COLORS.green, position: point(1, 1), acceptsCarId: 'car-green' },
      { id: 'park-cyan', color: '#06b6d4', position: point(3, 2), acceptsCarId: 'car-cyan' },
    ],
  },
  {
    id: 'level-004',
    name: 'Level 4 - Choke Stack',
    boardSize: { width: 6, height: 6 },
    cars: [
      { id: 'car-red', label: 'R', color: COLORS.red, position: point(0, 3) },
      { id: 'car-green', label: 'G', color: COLORS.green, position: point(2, 5) },
      { id: 'car-blue', label: 'B', color: COLORS.blue, position: point(4, 1) },
    ],
    obstacles: makeObstacles({
      width: 6,
      height: 6,
      open: [
        point(0, 3),
        point(1, 3),
        point(2, 3),
        point(3, 3),
        point(4, 3),
        point(5, 3),
        point(2, 0),
        point(2, 1),
        point(2, 2),
        point(2, 4),
        point(2, 5),
        point(4, 0),
        point(4, 1),
        point(4, 2),
      ],
    }),
    parkingSpots: [
      { id: 'park-red', color: COLORS.red, position: point(5, 3), acceptsCarId: 'car-red' },
      { id: 'park-green', color: COLORS.green, position: point(2, 0), acceptsCarId: 'car-green' },
      { id: 'park-blue', color: COLORS.blue, position: point(2, 3), acceptsCarId: 'car-blue' },
    ],
  },
  {
    id: 'level-005',
    name: 'Level 5 - One-Way Hub',
    boardSize: { width: 7, height: 6 },
    cars: [
      { id: 'car-red', label: 'R', color: COLORS.red, position: point(0, 3) },
      { id: 'car-green', label: 'G', color: COLORS.green, position: point(3, 5) },
      { id: 'car-blue', label: 'B', color: COLORS.blue, position: point(6, 1) },
    ],
    obstacles: makeObstacles({
      width: 7,
      height: 6,
      open: [
        point(0, 3),
        point(1, 3),
        point(2, 3),
        point(3, 3),
        point(4, 3),
        point(5, 3),
        point(6, 3),
        point(3, 0),
        point(3, 1),
        point(3, 2),
        point(3, 4),
        point(3, 5),
        point(6, 1),
        point(6, 2),
        point(1, 2),
      ],
    }),
    parkingSpots: [
      { id: 'park-red', color: COLORS.red, position: point(6, 3), acceptsCarId: 'car-red' },
      { id: 'park-green', color: COLORS.green, position: point(1, 2), acceptsCarId: 'car-green' },
      { id: 'park-blue', color: COLORS.blue, position: point(3, 0), acceptsCarId: 'car-blue' },
    ],
  },
  {
    id: 'level-006',
    name: 'Level 6 - Final Bottleneck',
    boardSize: { width: 7, height: 7 },
    cars: [
      { id: 'car-red', label: 'R', color: COLORS.red, position: point(0, 3) },
      { id: 'car-green', label: 'G', color: COLORS.green, position: point(3, 6) },
      { id: 'car-blue', label: 'B', color: COLORS.blue, position: point(6, 2) },
    ],
    obstacles: makeObstacles({
      width: 7,
      height: 7,
      open: [
        point(0, 3),
        point(1, 3),
        point(2, 3),
        point(3, 3),
        point(4, 3),
        point(5, 3),
        point(6, 3),
        point(3, 0),
        point(3, 1),
        point(3, 2),
        point(3, 4),
        point(3, 5),
        point(3, 6),
        point(6, 2),
        point(6, 1),
        point(5, 1),
        point(1, 4),
      ],
    }),
    parkingSpots: [
      { id: 'park-red', color: COLORS.red, position: point(6, 3), acceptsCarId: 'car-red' },
      { id: 'park-green', color: COLORS.green, position: point(1, 4), acceptsCarId: 'car-green' },
      { id: 'park-blue', color: COLORS.blue, position: point(3, 0), acceptsCarId: 'car-blue' },
    ],
  },
];
