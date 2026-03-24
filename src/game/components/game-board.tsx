import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { toBoardPixels, getBoardPixelSize } from '@/src/game/components/board-coordinates';
import { CarPiece } from '@/src/game/components/car-piece';
import { useGameStore } from '@/src/game/store/use-game-store';

const TILE_SIZE = 56;
const BOARD_TRANSFORM = { originX: 0, originY: 0, scale: 1 } as const;

export function GameBoard() {
  const level = useGameStore((state) => state.level);
  const cars = useGameStore((state) => state.cars);
  const selectedCarId = useGameStore((state) => state.selectedCarId);
  const movingCarId = useGameStore((state) => state.movingCarId);
  const status = useGameStore((state) => state.status);
  const tryMoveCarToOwnSpot = useGameStore((state) => state.tryMoveCarToOwnSpot);
  const advanceMovingCar = useGameStore((state) => state.advanceMovingCar);

  const boardWidth = getBoardPixelSize(level.boardSize.width, TILE_SIZE, BOARD_TRANSFORM);
  const boardHeight = getBoardPixelSize(level.boardSize.height, TILE_SIZE, BOARD_TRANSFORM);

  useEffect(() => {
    if (!movingCarId) {
      return;
    }

    const timer = setTimeout(() => {
      advanceMovingCar();
    }, 120);

    return () => clearTimeout(timer);
  }, [advanceMovingCar, movingCarId, cars]);

  const isInteractionDisabled = status !== 'playing' || !!movingCarId;

  return (
    <View
      style={[
        styles.board,
        {
          width: boardWidth,
          height: boardHeight,
        },
      ]}>
      {Array.from({ length: level.boardSize.width * level.boardSize.height }).map((_, index) => {
        const x = index % level.boardSize.width;
        const y = Math.floor(index / level.boardSize.width);
        const isDark = (x + y) % 2 === 0;
        const cellPosition = toBoardPixels(x, y, TILE_SIZE, BOARD_TRANSFORM);

        return (
          <View
            key={`cell-${x}-${y}`}
            style={[
              styles.cell,
              {
                left: cellPosition.x,
                top: cellPosition.y,
                width: TILE_SIZE * BOARD_TRANSFORM.scale,
                height: TILE_SIZE * BOARD_TRANSFORM.scale,
                backgroundColor: isDark ? '#1f2937' : '#111827',
              },
            ]}
          />
        );
      })}

      {level.parkingSpots.map((spot) => {
        const position = toBoardPixels(spot.position.x, spot.position.y, TILE_SIZE, BOARD_TRANSFORM);

        return (
          <View
            key={spot.id}
            style={[
              styles.parkingSpot,
              {
                width: TILE_SIZE * BOARD_TRANSFORM.scale,
                height: TILE_SIZE * BOARD_TRANSFORM.scale,
                left: position.x,
                top: position.y,
                borderColor: spot.color,
              },
            ]}
          />
        );
      })}

      {level.obstacles.map((obstacle) => {
        const position = toBoardPixels(obstacle.position.x, obstacle.position.y, TILE_SIZE, BOARD_TRANSFORM);

        return (
          <View
            key={obstacle.id}
            style={[
              styles.obstacle,
              {
                width: TILE_SIZE * BOARD_TRANSFORM.scale,
                height: TILE_SIZE * BOARD_TRANSFORM.scale,
                left: position.x,
                top: position.y,
              },
            ]}
          />
        );
      })}

      {cars.map((car) => (
        <CarPiece
          key={car.id}
          car={car}
          tileSize={TILE_SIZE}
          boardTransform={BOARD_TRANSFORM}
          isSelected={selectedCarId === car.id}
          onPress={() => {
            if (isInteractionDisabled) {
              return;
            }

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
    borderWidth: 2,
    borderColor: '#9ca3af',
  },
  parkingSpot: {
    position: 'absolute',
    borderWidth: 4,
    borderRadius: 10,
    backgroundColor: '#0f172a',
  },
});
