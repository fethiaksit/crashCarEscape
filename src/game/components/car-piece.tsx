import { memo, useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { Car, Position } from '@/src/game/types';

type CarPieceProps = {
  car: Car;
  tileSize: number;
  isSelected: boolean;
  isMoving: boolean;
  targetPosition: Position;
  onPress: () => void;
  onMoveComplete: () => void;
};

function CarPieceComponent({
  car,
  tileSize,
  isSelected,
  isMoving,
  targetPosition,
  onPress,
  onMoveComplete,
}: CarPieceProps) {
  const x = useSharedValue(car.position.x * tileSize);
  const y = useSharedValue(car.position.y * tileSize);

  useEffect(() => {
    if (isMoving) {
      x.value = withTiming(targetPosition.x * tileSize, {
        duration: 260,
        easing: Easing.out(Easing.cubic),
      });
      y.value = withTiming(
        targetPosition.y * tileSize,
        {
          duration: 260,
          easing: Easing.out(Easing.cubic),
        },
        (finished) => {
          if (finished) {
            runOnJS(onMoveComplete)();
          }
        },
      );
      return;
    }

    x.value = car.position.x * tileSize;
    y.value = car.position.y * tileSize;
  }, [car.position.x, car.position.y, isMoving, onMoveComplete, targetPosition.x, targetPosition.y, tileSize, x, y]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  return (
    <Animated.View style={[styles.wrapper, { width: tileSize, height: tileSize }, animatedStyle]}>
      <Pressable
        style={[styles.car, { backgroundColor: car.color }, isSelected && styles.selected]}
        onPress={onPress}>
        <Text style={styles.label}>{car.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export const CarPiece = memo(CarPieceComponent);

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    padding: 4,
  },
  car: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    borderColor: '#facc15',
    borderWidth: 3,
  },
  label: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 18,
  },
});
