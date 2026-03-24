import { Pressable, StyleSheet, Text, View } from 'react-native';

type LevelCardProps = {
  levelNumber: number;
  isCompleted: boolean;
  isCurrent: boolean;
  onPress: () => void;
};

export function LevelCard({ levelNumber, isCompleted, isCurrent, onPress }: LevelCardProps) {
  return (
    <Pressable style={[styles.card, isCurrent && styles.currentCard]} onPress={onPress}>
      <Text style={styles.levelText}>{levelNumber}</Text>
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
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#3b82f6',
    backgroundColor: '#0f172a',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  currentCard: {
    borderColor: '#facc15',
    backgroundColor: '#1e293b',
  },
  levelText: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '800',
  },
  metaWrap: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  doneText: {
    fontSize: 12,
    color: '#4ade80',
    fontWeight: '900',
  },
});
