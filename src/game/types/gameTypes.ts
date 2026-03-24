export type GameStatus = 'idle' | 'running' | 'win' | 'fail';

export type Direction = 'up' | 'down' | 'left' | 'right';

export type Vector2 = {
  x: number;
  y: number;
};

export type Car = {
  id: string;
  position: Vector2;
  direction: Direction;
  size: Vector2;
  color: string;
  isAtExit?: boolean;
};

export type Obstacle = {
  id: string;
  position: Vector2;
  size: Vector2;
};

export type Exit = {
  id: string;
  position: Vector2;
  size: Vector2;
};

export type Level = {
  id: string;
  width: number;
  height: number;
  cars: Car[];
  obstacles: Obstacle[];
  exits: Exit[];
};

export type MovementResult = {
  finalPosition: Vector2;
  distance: number;
  hitType: 'boundary' | 'obstacle' | 'car' | 'exit';
  hitId?: string;
  failed: boolean;
  reachedExit: boolean;
};
