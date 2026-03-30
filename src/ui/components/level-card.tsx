import { Pressable, StyleSheet, Text, View } from 'react-native';

type LevelCardProps = {
  levelNumber: number;
  isCompleted: boolean;
  isCurrent: boolean;
  onPress: () => void;
};

export function LevelCard({ levelNumber, isCompleted, isCurrent, onPress }: LevelCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        isCurrent && styles.currentCard,
        pressed && { transform: [{ scale: 1.05 }] },
      ]}
      onPress={onPress}>
      <Text style={[styles.levelText, isCurrent && styles.currentLevelText]}>{levelNumber}</Text>
      <View style={styles.metaWrap}>
        {isCompleted ? <Text style={styles.doneText}>✓</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '18%',
    minWidth: 58,
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(30, 41, 59, 0.65)',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  currentCard: {
    borderColor: '#2DD4BF',
    borderWidth: 2,
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
    shadowColor: '#2DD4BF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  levelText: {
    color: '#F1F5F9',
    fontSize: 13,
    fontWeight: '800',
  },
  currentLevelText: {
    color: '#2DD4BF',
    textShadowColor: 'rgba(45, 212, 191, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  metaWrap: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  doneText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '900',
    textShadowColor: 'rgba(139, 92, 246, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
});
