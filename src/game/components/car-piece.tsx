import { memo, useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { toBoardPixels, type BoardTransform } from '@/src/game/components/board-coordinates';
import type { Car } from '@/src/game/types';

type CarPieceProps = {
  car: Car;
  tileSize: number;
  boardTransform: BoardTransform;
  isSelected: boolean;
  onPress: () => void;
};

function CarPieceComponent({ car, tileSize, boardTransform, isSelected, onPress }: CarPieceProps) {
  const initialPosition = toBoardPixels(car.position.x, car.position.y, tileSize, boardTransform);
  const left = useSharedValue(initialPosition.x);
  const top = useSharedValue(initialPosition.y);

  useEffect(() => {
    const nextPosition = toBoardPixels(car.position.x, car.position.y, tileSize, boardTransform);
    left.value = withTiming(nextPosition.x, {
      duration: 110,
      easing: Easing.linear,
    });
    top.value = withTiming(nextPosition.y, {
      duration: 110,
      easing: Easing.linear,
    });
  }, [boardTransform, car.position.x, car.position.y, tileSize, left, top]);

  const animatedStyle = useAnimatedStyle(() => ({
    left: left.value,
    top: top.value,
  }));

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { width: tileSize * boardTransform.scale, height: tileSize * boardTransform.scale },
        animatedStyle,
      ]}>
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
