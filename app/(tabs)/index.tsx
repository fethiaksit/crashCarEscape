import { HomeScreen } from '@/src/ui/screens/home-screen';
import { GameScreen } from '@/src/ui/screens/game-screen';
import { useGameStore } from '@/src/game/store/use-game-store';

export default function AppEntryScreen() {
  const currentScreen = useGameStore((state) => state.currentScreen);

  if (currentScreen === 'home') {
    return <HomeScreen />;
  }

  return <GameScreen />;
}
