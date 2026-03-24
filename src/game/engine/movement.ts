import type { Car, Direction, MoveResolution, Position } from '@/src/game/types';

type ResolverInput = {
  carId: string;
  cars: Car[];
  obstacles: Position[];
  exits: { id: string; position: Position; acceptsCarIds?: string[] }[];
  boardSize: { width: number; height: number };
};

const DIRECTION_DELTA: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const key = (position: Position) => `${position.x},${position.y}`;

const isInsideBoard = (position: Position, boardSize: { width: number; height: number }) => {
  return (
    position.x >= 0 &&
    position.x < boardSize.width &&
    position.y >= 0 &&
    position.y < boardSize.height
  );
};

export function resolveCarMove(input: ResolverInput): MoveResolution {
  const car = input.cars.find((item) => item.id === input.carId);

  if (!car) {
    return {
      carId: input.carId,
      from: { x: 0, y: 0 },
      to: { x: 0, y: 0 },
      reason: 'invalid',
      failReason: 'Car not found',
    };
  }

  const occupiedByCars = new Set(
    input.cars.filter((item) => item.id !== car.id).map((item) => key(item.position)),
  );
  const occupiedByObstacles = new Set(input.obstacles.map((item) => key(item)));

  const delta = DIRECTION_DELTA[car.direction];
  let cursor = { ...car.position };

  while (true) {
    const next = { x: cursor.x + delta.x, y: cursor.y + delta.y };

    if (!isInsideBoard(next, input.boardSize)) {
      return {
        carId: car.id,
        from: car.position,
        to: cursor,
        reason: cursor.x === car.position.x && cursor.y === car.position.y ? 'none' : 'blocked',
      };
    }

    if (occupiedByCars.has(key(next)) || occupiedByObstacles.has(key(next))) {
      return {
        carId: car.id,
        from: car.position,
        to: cursor,
        reason: cursor.x === car.position.x && cursor.y === car.position.y ? 'none' : 'blocked',
      };
    }

    const matchedExit = input.exits.find((exit) => key(exit.position) === key(next));
    if (matchedExit) {
      const accepted = !matchedExit.acceptsCarIds || matchedExit.acceptsCarIds.includes(car.id);

      return {
        carId: car.id,
        from: car.position,
        to: next,
        reason: 'exited',
        exitId: matchedExit.id,
        failReason: accepted ? undefined : `${car.label} entered the wrong exit`,
      };
    }

    cursor = next;
  }
}
