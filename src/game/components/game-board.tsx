import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { CarPiece } from '@/src/game/components/car-piece';
import { useGameStore } from '@/src/game/store/use-game-store';

type GameBoardProps = {
  boardPixelSize: number;
};

export function GameBoard({ boardPixelSize }: GameBoardProps) {
  const level = useGameStore((state) => state.level);
  const cars = useGameStore((state) => state.cars);
  const selectedCarId = useGameStore((state) => state.selectedCarId);
  const movingCarId = useGameStore((state) => state.movingCarId);
  const status = useGameStore((state) => state.status);
  const tryMoveCarToOwnSpot = useGameStore((state) => state.tryMoveCarToOwnSpot);
  const advanceMovingCar = useGameStore((state) => state.advanceMovingCar);

  const tileSize = useMemo(() => {
    const maxDimension = Math.max(level.boardSize.width, level.boardSize.height);
    return Math.max(20, Math.floor(boardPixelSize / maxDimension));
  }, [boardPixelSize, level.boardSize.height, level.boardSize.width]);

  const boardWidth = level.boardSize.width * tileSize;
  const boardHeight = level.boardSize.height * tileSize;

  useEffect(() => {
    if (!movingCarId) return;

    const timer = setTimeout(() => {
      advanceMovingCar();
    }, 90);

    return () => clearTimeout(timer);
  }, [advanceMovingCar, movingCarId, cars]);

  const isInteractionDisabled = status !== 'playing' || !!movingCarId;

  return (
    <View style={[styles.board, { width: boardWidth, height: boardHeight }]}>
      {Array.from({ length: level.boardSize.width * level.boardSize.height }).map((_, index) => {
        const x = index % level.boardSize.width;
        const y = Math.floor(index / level.boardSize.width);
        const isDark = (x + y) % 2 === 0;

        return (
          <View
            key={`cell-${x}-${y}`}
            style={[
              styles.cell,
              {
                left: x * tileSize,
                top: y * tileSize,
                width: tileSize,
                height: tileSize,
                backgroundColor: isDark ? '#1f2937' : '#111827',
              },
            ]}
          />
        );
      })}

      {level.parkingSpots.map((spot) => (
        <View
          key={spot.id}
          style={[
            styles.parkingSpot,
            {
              width: tileSize,
              height: tileSize,
              left: spot.position.x * tileSize,
              top: spot.position.y * tileSize,
              borderColor: spot.color,
              borderWidth: Math.max(2, Math.floor(tileSize * 0.08)),
              borderRadius: Math.max(6, Math.floor(tileSize * 0.18)),
            },
          ]}
        />
      ))}

      {level.obstacles.map((obstacle) => (
        <View
          key={obstacle.id}
          style={[
            styles.obstacle,
            {
              width: tileSize,
              height: tileSize,
              left: obstacle.position.x * tileSize,
              top: obstacle.position.y * tileSize,
              borderWidth: Math.max(1, Math.floor(tileSize * 0.06)),
            },
          ]}
        />
      ))}

      {cars.map((car) => (
        <CarPiece
          key={car.id}
          car={car}
          tileSize={tileSize}
          isSelected={selectedCarId === car.id}
          onPress={() => {
            if (isInteractionDisabled) return;
            tryMoveCarToOwnSpot(car.id);
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#334155',
    backgroundColor: '#0b1220',
  },
  cell: {
    position: 'absolute',
  },
  obstacle: {
    position: 'absolute',
    backgroundColor: '#6b7280',
    borderColor: '#9ca3af',
  },
  parkingSpot: {
    position: 'absolute',
    backgroundColor: '#0f172a',
  },
});
