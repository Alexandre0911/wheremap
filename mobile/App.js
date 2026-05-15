import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppProvider, useApp } from './src/context/AppContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { getDisplayId } from './src/services/storage';

const Stack = createNativeStackNavigator();

const linking = {
  config: {
    screens: {
      NameSetup: 'setup',
      Home: '',
      Join: 'join/:pin',
      Lobby: 'lobby',
      Map: 'map',
      Leaderboard: 'leaderboard',
    },
  },
};

function AppContent() {
  const { theme, isDark } = useTheme();
  const { connect } = useApp();
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    getDisplayId().then((id) => setInitialRoute(id ? 'Home' : 'NameSetup'));
  }, []);

  const navTheme = {
    dark: isDark,
    colors: {
      primary: theme.primary,
      background: theme.background,
      card: theme.surface,
      text: theme.text,
      border: theme.border,
      notification: theme.primary,
    },
    fonts: {
      regular: { fontFamily: 'System', fontWeight: '400' },
      medium: { fontFamily: 'System', fontWeight: '500' },
      bold: { fontFamily: 'System', fontWeight: '700' },
      heavy: { fontFamily: 'System', fontWeight: '800' },
    },
  };

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme} linking={linking}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        <Stack.Screen name="NameSetup" component={NameSetupScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Join" component={JoinScreen} />
        <Stack.Screen name="Lobby" component={LobbyScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ presentation: 'modal' }} />
      </Stack.Navigator>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </NavigationContainer>
  );
}

export default function App() {
  const serverUrl = 'https://app.coraminegaol.eu';

  return (
    <ThemeProvider>
      <AppProvider serverUrl={serverUrl}>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
}