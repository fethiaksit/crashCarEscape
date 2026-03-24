import { Level } from '@/game/types/gameTypes';

export const level001: Level = {
  id: 'level-001',
  width: 360,
  height: 640,
  cars: [
    {
      id: 'car-a',
      position: { x: 40, y: 120 },
      direction: 'right',
      size: { x: 60, y: 40 },
      color: '#3B82F6',
    },
    {
      id: 'car-b',
      position: { x: 80, y: 300 },
      direction: 'up',
      size: { x: 40, y: 60 },
      color: '#F97316',
    },
  ],
  obstacles: [
    {
      id: 'ob-1',
      position: { x: 220, y: 120 },
      size: { x: 60, y: 120 },
    },
  ],
  exits: [
    {
      id: 'exit-1',
      position: { x: 300, y: 20 },
      size: { x: 50, y: 50 },
    },
  ],
};
