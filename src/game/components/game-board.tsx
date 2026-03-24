import { StyleSheet, View } from 'react-native';

import { CarPiece } from '@/src/game/components/car-piece';
import { useGameStore } from '@/src/game/store/use-game-store';

const TILE_SIZE = 56;

export function GameBoard() {
  const level = useGameStore((state) => state.level);
  const cars = useGameStore((state) => state.cars);
  const selectedCarId = useGameStore((state) => state.selectedCarId);
  const movingCarId = useGameStore((state) => state.movingCarId);
  const pendingMove = useGameStore((state) => state.pendingMove);
  const tapCar = useGameStore((state) => state.tapCar);
  const completeMove = useGameStore((state) => state.completeMove);

  return (
    <View
      style={[
        styles.board,
        {
          width: level.boardSize.width * TILE_SIZE,
          height: level.boardSize.height * TILE_SIZE,
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

      {level.exits.map((exit) => (
        <View
          key={exit.id}
          style={[
            styles.exit,
            {
              width: TILE_SIZE,
              height: TILE_SIZE,
              left: exit.position.x * TILE_SIZE,
              top: exit.position.y * TILE_SIZE,
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

      {cars.map((car) => (
        <CarPiece
          key={car.id}
          car={car}
          tileSize={TILE_SIZE}
          isSelected={selectedCarId === car.id}
          isMoving={movingCarId === car.id}
          targetPosition={pendingMove?.carId === car.id ? pendingMove.to : car.position}
          onPress={() => tapCar(car.id)}
          onMoveComplete={completeMove}
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
  exit: {
    position: 'absolute',
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#86efac',
  },
});
