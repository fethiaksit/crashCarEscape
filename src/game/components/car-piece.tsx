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
        style={({ pressed }) => [
          styles.car,
          {
            backgroundColor: car.color,
            shadowColor: car.color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.9,
            shadowRadius: 10,
            elevation: 10,
          },
          isSelected && styles.selected,
          pressed && { transform: [{ scale: 1.05 }] },
        ]}
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
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    borderColor: '#ffffff',
    borderWidth: 3,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 15,
  },
  label: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 20,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
});
