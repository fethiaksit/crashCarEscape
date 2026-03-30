import type { LevelDefinition } from '@/src/game/types';

export const LEVEL_002: LevelDefinition = {
  id: 'level-002',
  name: 'Level 2',
  boardSize: {
    width: 6,
    height: 6,
  },
  cars: [
    {
      id: 'car-red',
      label: 'R',
      color: '#ef4444',
      position: { x: 0, y: 3 },
    },
    {
      id: 'car-green',
      label: 'G',
      color: '#22c55e',
      position: { x: 2, y: 0 },
    },
    {
      id: 'car-blue',
      label: 'B',
      color: '#3b82f6',
      position: { x: 5, y: 1 },
    },
  ],
  obstacles: [
    {
      id: 'obs-1',
      position: { x: 2, y: 4 },
    },
    {
      id: 'obs-2',
      position: { x: 4, y: 2 },
    },
  ],
  parkingSpots: [
    {
      id: 'park-red',
      position: { x: 5, y: 3 },
      color: '#ef4444',
      acceptsCarId: 'car-red',
    },
    {
      id: 'park-green',
      position: { x: 0, y: 0 },
      color: '#22c55e',
      acceptsCarId: 'car-green',
    },
    {
      id: 'park-blue',
      position: { x: 3, y: 5 },
      color: '#3b82f6',
      acceptsCarId: 'car-blue',
    },
  ],
};
