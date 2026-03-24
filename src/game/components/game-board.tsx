import { useEffect, useMemo } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';

import { CarPiece } from '@/src/game/components/car-piece';
import { useGameStore } from '@/src/game/store/use-game-store';

const TILE_SIZE = 56;

const pointFromTouch = (
  x: number,
  y: number,
  boardWidth: number,
  boardHeight: number,
): { x: number; y: number } | undefined => {
  if (x < 0 || y < 0 || x >= boardWidth || y >= boardHeight) {
    return undefined;
  }

  return {
    x: Math.floor(x / TILE_SIZE),
    y: Math.floor(y / TILE_SIZE),
  };
};

export function GameBoard() {
  const level = useGameStore((state) => state.level);
  const cars = useGameStore((state) => state.cars);
  const selectedCarId = useGameStore((state) => state.selectedCarId);
  const movingCarId = useGameStore((state) => state.movingCarId);
  const drawingPath = useGameStore((state) => state.drawingPath);
  const status = useGameStore((state) => state.status);
  const selectCar = useGameStore((state) => state.selectCar);
  const startDrawingPath = useGameStore((state) => state.startDrawingPath);
  const extendDrawingPath = useGameStore((state) => state.extendDrawingPath);
  const finishDrawingPath = useGameStore((state) => state.finishDrawingPath);
  const advanceMovingCar = useGameStore((state) => state.advanceMovingCar);

  const boardWidth = level.boardSize.width * TILE_SIZE;
  const boardHeight = level.boardSize.height * TILE_SIZE;

  useEffect(() => {
    if (!movingCarId) {
      return;
    }

    const timer = setTimeout(() => {
      advanceMovingCar();
    }, 120);

    return () => clearTimeout(timer);
  }, [advanceMovingCar, movingCarId, cars]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => status === 'playing' && !!selectedCarId && !movingCarId,
        onMoveShouldSetPanResponder: () => status === 'playing' && !!selectedCarId && !movingCarId,
        onPanResponderGrant: (evt) => {
          const point = pointFromTouch(
            evt.nativeEvent.locationX,
            evt.nativeEvent.locationY,
            boardWidth,
            boardHeight,
          );

          if (point) {
            startDrawingPath(point);
          }
        },
        onPanResponderMove: (evt) => {
          const point = pointFromTouch(
            evt.nativeEvent.locationX,
            evt.nativeEvent.locationY,
            boardWidth,
            boardHeight,
          );

          if (point) {
            extendDrawingPath(point);
          }
        },
        onPanResponderRelease: () => {
          finishDrawingPath();
        },
      }),
    [boardHeight, boardWidth, extendDrawingPath, finishDrawingPath, movingCarId, selectedCarId, startDrawingPath, status],
  );

  return (
    <View
      {...panResponder.panHandlers}
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

        return (
          <View
            key={`cell-${x}-${y}`}
            style={[
              styles.cell,
              {
                left: x * TILE_SIZE,
                top: y * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE,
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
              width: TILE_SIZE,
              height: TILE_SIZE,
              left: spot.position.x * TILE_SIZE,
              top: spot.position.y * TILE_SIZE,
              borderColor: spot.color,
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
              width: TILE_SIZE,
              height: TILE_SIZE,
              left: obstacle.position.x * TILE_SIZE,
              top: obstacle.position.y * TILE_SIZE,
            },
          ]}
        />
      ))}

      {drawingPath.map((point, index) => (
        <View
          key={`path-${point.x}-${point.y}-${index}`}
          style={[
            styles.pathDot,
            {
              left: point.x * TILE_SIZE + TILE_SIZE / 2 - 8,
              top: point.y * TILE_SIZE + TILE_SIZE / 2 - 8,
            },
          ]}
        />
      ))}

      {cars.map((car) => (
        <CarPiece
          key={car.id}
          car={car}
          tileSize={TILE_SIZE}
          isSelected={selectedCarId === car.id}
          onPress={() => selectCar(car.id)}
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
  pathDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    opacity: 0.7,
  },
});
