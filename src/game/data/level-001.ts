import type { LevelDefinition } from '@/src/game/types';

export const LEVEL_001: LevelDefinition = {
  id: 'level-001',
  name: 'Level 1',
  boardSize: {
    width: 6,
    height: 6,
  },
  cars: [
    {
      id: 'car-red',
      label: 'R',
      color: '#ef4444',
      position: { x: 0, y: 2 },
      direction: 'right',
      requiredToExit: true,
    },
    {
      id: 'car-blue',
      label: 'B',
      color: '#3b82f6',
      position: { x: 4, y: 0 },
      direction: 'down',
      requiredToExit: false,
    },
  ],
  obstacles: [
    {
      id: 'obs-1',
      position: { x: 3, y: 4 },
    },
    {
      id: 'obs-2',
      position: { x: 1, y: 1 },
    },
  ],
  exits: [
    {
      id: 'exit-main',
      position: { x: 5, y: 2 },
      acceptsCarIds: ['car-red'],
    },
  ],
};
