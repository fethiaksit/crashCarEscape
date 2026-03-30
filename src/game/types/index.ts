export type Position = {
  x: number;
  y: number;
};

export type Car = {
  id: string;
  label: string;
  color: string;
  position: Position;
};

export type Obstacle = {
  id: string;
  position: Position;
};

export type ParkingSpot = {
  id: string;
  position: Position;
  color: string;
  acceptsCarId?: string;
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
  parkingSpots: ParkingSpot[];
};
