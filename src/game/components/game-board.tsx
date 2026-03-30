import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import {
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
        padding: 0,
      }),
    [viewportHeight, viewportWidth, levelBounds],
  );

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
            width: viewportWidth,
            height: viewportHeight,
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
                  left: cellPosition.x,
                  top: cellPosition.y,
                  width: TILE_SIZE * boardTransform.scale,
                  height: TILE_SIZE * boardTransform.scale,
                  backgroundColor: isDark ? 'rgba(30, 41, 59, 0.6)' : 'transparent',
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
                  left: position.x,
                  top: position.y,
                  borderColor: spot.color,
                  shadowColor: spot.color,
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
            boardTransform={boardTransform}
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
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#1E293B',
  },
  cell: {
    position: 'absolute',
    borderRadius: 12,
  },
  obstacle: {
    position: 'absolute',
    backgroundColor: '#334155',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#475569',
  },
  parkingSpot: {
    position: 'absolute',
    borderWidth: 3,
    borderStyle: 'dashed',
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
});
