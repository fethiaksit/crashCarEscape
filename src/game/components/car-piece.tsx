import { memo, useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import type { Car } from '@/src/game/types';

type CarPieceProps = {
  car: Car;
  tileSize: number;
  isSelected: boolean;
  onPress: () => void;
};

function CarPieceComponent({ car, tileSize, isSelected, onPress }: CarPieceProps) {
  const x = useSharedValue(car.position.x * tileSize);
  const y = useSharedValue(car.position.y * tileSize);

  useEffect(() => {
    x.value = withTiming(car.position.x * tileSize, {
      duration: 110,
      easing: Easing.linear,
    });
    y.value = withTiming(car.position.y * tileSize, {
      duration: 110,
      easing: Easing.linear,
    });
  }, [car.position.x, car.position.y, tileSize, x, y]);

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
