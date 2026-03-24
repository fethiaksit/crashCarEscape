import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Canvas, Rect } from '@shopify/react-native-skia';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useGameStore } from '@/game/store/gameStore';

const BOARD_COLOR = '#0F172A';

type CarSpriteProps = {
  carId: string;
};

const CarSprite = ({ carId }: CarSpriteProps) => {
  const car = useGameStore((s) => s.cars.find((c) => c.id === carId));

  const x = useSharedValue(car?.position.x ?? 0);
  const y = useSharedValue(car?.position.y ?? 0);

  useEffect(() => {
    if (!car) return;
    x.value = withTiming(car.position.x, { duration: 280 });
    y.value = withTiming(car.position.y, { duration: 280 });
  }, [car?.position.x, car?.position.y, car, x, y]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  if (!car || car.isAtExit) {
    return null;
  }

  return (
    <Animated.View style={[styles.car, style, { width: car.size.x, height: car.size.y, backgroundColor: car.color }]} />
  );
};

export const GameBoard = () => {
  const level = useGameStore((s) => s.currentLevel);
  const cars = useGameStore((s) => s.cars);
  const selectedCarId = useGameStore((s) => s.selectedCarId);
  const selectCar = useGameStore((s) => s.selectCar);
  const moveSelectedCar = useGameStore((s) => s.moveSelectedCar);

  const onCarPress = (carId: string) => {
    if (selectedCarId !== carId) {
      selectCar(carId);
      return;
    }

    moveSelectedCar();
  };

  return (
    <View style={[styles.board, { width: level.width, height: level.height, backgroundColor: BOARD_COLOR }]}>
      <Canvas style={StyleSheet.absoluteFillObject}>
        {level.exits.map((exit) => (
          <Rect
            key={exit.id}
            x={exit.position.x}
            y={exit.position.y}
            width={exit.size.x}
            height={exit.size.y}
            color="#16A34A"
          />
        ))}

        {level.obstacles.map((obs) => (
          <Rect
            key={obs.id}
            x={obs.position.x}
            y={obs.position.y}
            width={obs.size.x}
            height={obs.size.y}
            color="#64748B"
          />
        ))}
      </Canvas>

      {cars.map((car) => (
        <Pressable
          key={car.id}
          style={[
            styles.tapTarget,
            {
              left: car.position.x,
              top: car.position.y,
              width: car.size.x,
              height: car.size.y,
              borderColor: selectedCarId === car.id ? '#FACC15' : 'transparent',
            },
          ]}
          onPress={() => onCarPress(car.id)}
        />
      ))}

      {cars.map((car) => (
        <CarSprite key={`sprite-${car.id}`} carId={car.id} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  board: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  tapTarget: {
    position: 'absolute',
    borderWidth: 2,
    zIndex: 30,
  },
  car: {
    position: 'absolute',
    borderRadius: 8,
    zIndex: 20,
  },
});
