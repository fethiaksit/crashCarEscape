import { Car, Direction, Exit, MovementResult, Obstacle, Vector2 } from '@/game/types/gameTypes';

const STEP = 2;

const overlaps = (aPos: Vector2, aSize: Vector2, bPos: Vector2, bSize: Vector2): boolean => {
  return (
    aPos.x < bPos.x + bSize.x &&
    aPos.x + aSize.x > bPos.x &&
    aPos.y < bPos.y + bSize.y &&
    aPos.y + aSize.y > bPos.y
  );
};

export const directionToVector = (direction: Direction): Vector2 => {
  switch (direction) {
    case 'up':
      return { x: 0, y: -1 };
    case 'down':
      return { x: 0, y: 1 };
    case 'left':
      return { x: -1, y: 0 };
    case 'right':
      return { x: 1, y: 0 };
  }
};

export const findStopPoint = (
  movingCar: Car,
  allCars: Car[],
  obstacles: Obstacle[],
  exits: Exit[],
  board: { width: number; height: number },
): MovementResult => {
  const direction = directionToVector(movingCar.direction);

  let position = { ...movingCar.position };
  let traveled = 0;

  while (true) {
    const nextPosition = {
      x: position.x + direction.x * STEP,
      y: position.y + direction.y * STEP,
    };

    const outOfBounds =
      nextPosition.x < 0 ||
      nextPosition.y < 0 ||
      nextPosition.x + movingCar.size.x > board.width ||
      nextPosition.y + movingCar.size.y > board.height;

    if (outOfBounds) {
      return {
        finalPosition: position,
        distance: traveled,
        hitType: 'boundary',
        failed: false,
        reachedExit: false,
      };
    }

    const hitExit = exits.find((exit) => overlaps(nextPosition, movingCar.size, exit.position, exit.size));

    if (hitExit) {
      traveled += STEP;
      return {
        finalPosition: nextPosition,
        distance: traveled,
        hitType: 'exit',
        hitId: hitExit.id,
        failed: false,
        reachedExit: true,
      };
    }

    const hitObstacle = obstacles.find((obs) => overlaps(nextPosition, movingCar.size, obs.position, obs.size));

    if (hitObstacle) {
      traveled += STEP;
      return {
        finalPosition: nextPosition,
        distance: traveled,
        hitType: 'obstacle',
        hitId: hitObstacle.id,
        failed: true,
        reachedExit: false,
      };
    }

    const hitCar = allCars.find(
      (car) => car.id !== movingCar.id && !car.isAtExit && overlaps(nextPosition, movingCar.size, car.position, car.size),
    );

    if (hitCar) {
      traveled += STEP;
      return {
        finalPosition: nextPosition,
        distance: traveled,
        hitType: 'car',
        hitId: hitCar.id,
        failed: true,
        reachedExit: false,
      };
    }

    position = nextPosition;
    traveled += STEP;
  }
};

export const getFinalPosition = (
  movingCar: Car,
  cars: Car[],
  obstacles: Obstacle[],
  exits: Exit[],
  board: { width: number; height: number },
): MovementResult => {
  return findStopPoint(movingCar, cars, obstacles, exits, board);
};
