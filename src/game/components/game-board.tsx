import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  getBoardPixelSize,
  getLevelBounds,
  getResponsiveBoardTransform,
  toBoardPixels,
} from '@/src/game/components/board-coordinates';
import { CarPiece } from '@/src/game/components/car-piece';
import { useGameStore } from '@/src/game/store/use-game-store';

type GameBoardProps = {
  viewportWidth: number;
  viewportHeight: number;
};

const TILE_SIZE = 56;

export function GameBoard({ viewportWidth, viewportHeight }: GameBoardProps) {
  const level = useGameStore((state) => state.level);
  const cars = useGameStore((state) => state.cars);
  const selectedCarId = useGameStore((state) => state.selectedCarId);
  const movingCarId = useGameStore((state) => state.movingCarId);
  const status = useGameStore((state) => state.status);
  const tryMoveCarToOwnSpot = useGameStore((state) => state.tryMoveCarToOwnSpot);
  const advanceMovingCar = useGameStore((state) => state.advanceMovingCar);

  const levelBounds = useMemo(() => getLevelBounds(level), [level]);
  const boardTransform = useMemo(
    () =>
      getResponsiveBoardTransform({
        viewportWidth,
        viewportHeight,
        levelBounds,
        tileSize: TILE_SIZE,
        padding: 10,
      }),
    [viewportHeight, viewportWidth, levelBounds],
  );

  const boardWidth = getBoardPixelSize(levelBounds.width, TILE_SIZE, boardTransform);
  const boardHeight = getBoardPixelSize(levelBounds.height, TILE_SIZE, boardTransform);

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
        styles.viewport,
        {
          width: viewportWidth,
          height: viewportHeight,
        },
      ]}>
      <View
        style={[
          styles.board,
          {
            width: boardWidth,
            height: boardHeight,
          },
        ]}>
        {Array.from({ length: levelBounds.width * levelBounds.height }).map((_, index) => {
          const x = (index % levelBounds.width) + levelBounds.minX;
          const y = Math.floor(index / levelBounds.width) + levelBounds.minY;
          const isDark = (x + y) % 2 === 0;
          const cellPosition = toBoardPixels(x, y, TILE_SIZE, boardTransform);

          return (
            <View
              key={`cell-${x}-${y}`}
              style={[
                styles.cell,
                {
                  left: cellPosition.x - boardTransform.originX,
                  top: cellPosition.y - boardTransform.originY,
                  width: TILE_SIZE * boardTransform.scale,
                  height: TILE_SIZE * boardTransform.scale,
                  backgroundColor: isDark ? '#1f2937' : '#111827',
                },
              ]}
            />
          );
        })}

        {level.parkingSpots.map((spot) => {
          const position = toBoardPixels(spot.position.x, spot.position.y, TILE_SIZE, boardTransform);

          return (
            <View
              key={spot.id}
              style={[
                styles.parkingSpot,
                {
                  width: TILE_SIZE * boardTransform.scale,
                  height: TILE_SIZE * boardTransform.scale,
                  left: position.x - boardTransform.originX,
                  top: position.y - boardTransform.originY,
                  borderColor: spot.color,
                },
              ]}
            />
          );
        })}

        {level.obstacles.map((obstacle) => {
          const position = toBoardPixels(obstacle.position.x, obstacle.position.y, TILE_SIZE, boardTransform);

          return (
            <View
              key={obstacle.id}
              style={[
                styles.obstacle,
                {
                  width: TILE_SIZE * boardTransform.scale,
                  height: TILE_SIZE * boardTransform.scale,
                  left: position.x - boardTransform.originX,
                  top: position.y - boardTransform.originY,
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
            boardTransform={{ ...boardTransform, originX: 0, originY: 0 }}
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
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    justifyContent: 'center',
    alignItems: 'center',
  },
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
