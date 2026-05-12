import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useApp } from '../context/AppContext';
import ColorPicker from '../components/ColorPicker';

export default function HomeScreen({ navigation }) {
  const {
    user,
    dispatch,
    connect,
    createLobby,
    joinLobby,
    connected,
    lobby,
    participants,
    socketId,
  } = useApp();

  const [nickname, setNickname] = useState(user.nickname);
  const [selectedColor, setSelectedColor] = useState(user.color);
  const [pin, setPin] = useState('');
  const [mode, setMode] = useState('create');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    if (lobby) {
      setLoading(false);
      navigation.replace('Lobby');
    }
  }, [lobby, navigation]);

  const handleCreate = () => {
    if (!nickname.trim()) {
      Alert.alert('Error', 'Please enter a nickname');
      return;
    }
    setLoading(true);
    dispatch({
      type: 'SET_USER',
      payload: { nickname: nickname.trim(), color: selectedColor },
    });
    createLobby(nickname.trim(), selectedColor);
    setTimeout(() => setLoading(false), 3000);
  };

  const handleJoin = () => {
    if (!nickname.trim()) {
      Alert.alert('Error', 'Please enter a nickname');
      return;
    }
    if (pin.length !== 6) {
      Alert.alert('Error', 'PIN must be exactly 6 digits');
      return;
    }
    setLoading(true);
    dispatch({
      type: 'SET_USER',
      payload: { nickname: nickname.trim(), color: selectedColor },
    });
    joinLobby(pin, nickname.trim(), selectedColor);
    setTimeout(() => setLoading(false), 5000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>WhereMap</Text>
        <Text style={styles.subtitle}>Real-time location sharing</Text>

        <View style={styles.statusRow}>
          <View
            style={[
              styles.dot,
              { backgroundColor: connected ? '#1DD1A1' : '#FF6B6B' },
            ]}
          />
          <Text style={styles.statusText}>
            {connected ? 'Connected' : 'Connecting...'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Nickname</Text>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            placeholder="Enter your nickname"
            placeholderTextColor="#555"
            maxLength={20}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Color</Text>
          <ColorPicker
            selectedColor={selectedColor}
            onSelect={setSelectedColor}
          />
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, mode === 'create' && styles.tabActive]}
            onPress={() => setMode('create')}
          >
            <Text
              style={[
                styles.tabText,
                mode === 'create' && styles.tabTextActive,
              ]}
            >
              Create
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, mode === 'join' && styles.tabActive]}
            onPress={() => setMode('join')}
          >
            <Text
              style={[
                styles.tabText,
                mode === 'join' && styles.tabTextActive,
              ]}
            >
              Join
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'create' ? (
          <TouchableOpacity
            style={[styles.button, !connected && styles.buttonDisabled]}
            onPress={handleCreate}
            disabled={!connected || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Lobby</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View>
            <TextInput
              style={styles.pinInput}
              value={pin}
              onChangeText={(t) =>
                setPin(t.replace(/[^0-9]/g, '').slice(0, 6))
              }
              placeholder="000000"
              placeholderTextColor="#555"
              keyboardType="number-pad"
              maxLength={6}
            />
            <TouchableOpacity
              style={[styles.button, !connected && styles.buttonDisabled]}
              onPress={handleJoin}
              disabled={!connected || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Join Lobby</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#888',
    fontSize: 13,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    color: '#888',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#16213e',
  },
  tabActive: {
    backgroundColor: '#0f3460',
  },
  tabText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  pinInput: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    fontSize: 28,
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 10,
    borderWidth: 1,
    borderColor: '#0f3460',
    marginBottom: 12,
    fontVariant: ['tabular-nums'],
  },
  button: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
