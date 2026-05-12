import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppProvider } from './src/context/AppContext';
import HomeScreen from './src/screens/HomeScreen';
import LobbyScreen from './src/screens/LobbyScreen';
import MapScreen from './src/screens/MapScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';

const Stack = createNativeStackNavigator();

const theme = {
  dark: true,
  colors: {
    primary: '#e94560',
    background: '#1a1a2e',
    card: '#16213e',
    text: '#fff',
    border: '#0f3460',
    notification: '#e94560',
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    bold: { fontFamily: 'System', fontWeight: '700' },
    heavy: { fontFamily: 'System', fontWeight: '800' },
  },
};

const linking = {
  config: {
    screens: {
      Home: '',
      Lobby: 'lobby',
      Map: 'map',
      Leaderboard: 'leaderboard',
    },
  },
};

export default function App() {
  const serverUrl = 'https://app.coraminegaol.eu';


  return (
    <AppProvider serverUrl={serverUrl}>
      <NavigationContainer theme={theme} linking={linking}>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Lobby" component={LobbyScreen} />
          <Stack.Screen name="Map" component={MapScreen} />
          <Stack.Screen
            name="Leaderboard"
            component={LeaderboardScreen}
            options={{ presentation: 'modal' }}
          />
        </Stack.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </AppProvider>
  );
}
