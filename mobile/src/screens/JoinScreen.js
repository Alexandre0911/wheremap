import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

export default function JoinScreen({ route, navigation }) {
  const pin = route.params?.pin;
  const { user, joinLobby, lobby, connected, connect } = useApp();

  useEffect(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    if (!pin) {
      navigation.replace('Home');
      return;
    }
    if (connected && user.nickname) {
      joinLobby(pin, user.nickname, user.color);
    } else if (connected && !user.nickname) {
      navigation.replace('Home', { pin });
    }
  }, [connected, user.nickname, pin]);

  useEffect(() => {
    if (lobby) {
      navigation.replace('Lobby');
    }
  }, [lobby, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: '#1a1a2e' }]}>
      <ActivityIndicator size="large" color="#e94560" />
      <Text style={styles.text}>Joining lobby {pin}...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  text: { color: '#888', fontSize: 16 },
});