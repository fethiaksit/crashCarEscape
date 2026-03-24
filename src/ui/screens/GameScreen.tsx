import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { GameBoard } from '@/game/components/GameBoard';
import { useGameStore } from '@/game/store/gameStore';

export const GameScreen = () => {
  const gameStatus = useGameStore((s) => s.gameStatus);
  const resetLevel = useGameStore((s) => s.resetLevel);

  const statusLabel =
    gameStatus === 'win' ? 'You Win!' : gameStatus === 'fail' ? 'Crash! You Failed' : 'Tap a car, then tap it again to move';

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>
        <Text style={styles.title}>Crash Car Escape</Text>
        <Text style={styles.subtitle}>{statusLabel}</Text>

        <GameBoard />

        <TouchableOpacity style={styles.resetButton} onPress={resetLevel}>
          <Text style={styles.resetLabel}>Reset</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#020617',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 12,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 24,
  },
  subtitle: {
    color: '#CBD5E1',
    fontSize: 14,
  },
  resetButton: {
    backgroundColor: '#1D4ED8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resetLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
