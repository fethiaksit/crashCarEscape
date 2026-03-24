export type Direction = 'up' | 'down' | 'left' | 'right';

export type Position = {
  x: number;
  y: number;
};

export type Car = {
  id: string;
  label: string;
  color: string;
  position: Position;
  direction: Direction;
  requiredToExit: boolean;
};

export type Obstacle = {
  id: string;
  position: Position;
};

export type Exit = {
  id: string;
  position: Position;
  acceptsCarIds?: string[];
};

export type BoardSize = {
  width: number;
  height: number;
};

export type GameStatus = 'playing' | 'won' | 'failed';

export type LevelDefinition = {
  id: string;
  name: string;
  boardSize: BoardSize;
  cars: Car[];
  obstacles: Obstacle[];
  exits: Exit[];
};

export type MoveStopReason = 'blocked' | 'exited' | 'invalid' | 'none';

export type MoveResolution = {
  carId: string;
  from: Position;
  to: Position;
  reason: MoveStopReason;
  exitId?: string;
  failReason?: string;
};
