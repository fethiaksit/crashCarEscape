import type { LevelDefinition } from '@/src/game/types';

export const LEVEL_003: LevelDefinition = {
  id: 'level-003',
  name: 'Level 3',
  boardSize: {
    width: 7,
    height: 6,
  },
  cars: [
    {
      id: 'car-red',
      label: 'R',
      color: '#ef4444',
      position: { x: 1, y: 2 },
      direction: 'right',
      requiredToExit: true,
    },
    {
      id: 'car-gold',
      label: 'Y',
      color: '#eab308',
      position: { x: 0, y: 5 },
      direction: 'up',
      requiredToExit: false,
    },
    {
      id: 'car-cyan',
      label: 'C',
      color: '#06b6d4',
      position: { x: 6, y: 0 },
      direction: 'down',
      requiredToExit: false,
    },
  ],
  obstacles: [
    {
      id: 'obs-1',
      position: { x: 3, y: 2 },
    },
    {
      id: 'obs-2',
      position: { x: 4, y: 4 },
    },
    {
      id: 'obs-3',
      position: { x: 2, y: 0 },
    },
  ],
  exits: [
    {
      id: 'exit-main',
      position: { x: 6, y: 2 },
      acceptsCarIds: ['car-red'],
    },
  ],
};
