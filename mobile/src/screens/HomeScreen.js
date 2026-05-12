import React, { useState, useEffect, useMemo } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import ColorPicker from '../components/ColorPicker';
import { getTopSpeed } from '../services/storage';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { theme, mode, toggleTheme } = useTheme();
  const {
    user,
    dispatch,
    connect,
    createLobby,
    joinLobby,
    connected,
    lobby,
  } = useApp();

  const [nickname, setNickname] = useState(user.nickname);
  const [selectedColor, setSelectedColor] = useState(user.color);
  const [pin, setPin] = useState('');
  const [mode_, setMode_] = useState('create');
  const [loading, setLoading] = useState(false);
  const [topSpeed, setTopSpeed] = useState(0);

  useEffect(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    if (lobby) {
      setLoading(false);
      navigation.replace('Lobby');
    }
  }, [lobby, navigation]);

  useEffect(() => {
    getTopSpeed().then(setTopSpeed);
  }, []);

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

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    content: { flex: 1, padding: 24, justifyContent: 'center' },
    title: { fontSize: 34, fontWeight: '800', color: theme.text, textAlign: 'center', letterSpacing: 1 },
    subtitle: { fontSize: 15, color: theme.textSecondary, textAlign: 'center', marginBottom: 28 },
    statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 28, gap: 8 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    statusText: { color: theme.textSecondary, fontSize: 13 },
    persistentSpeedRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', marginBottom: 22, gap: 6 },
    persistentSpeedLabel: { color: theme.textMuted, fontSize: 10, fontWeight: '600', letterSpacing: 1.5 },
    persistentSpeedValue: { color: theme.accent, fontSize: 20, fontWeight: '800', fontVariant: ['tabular-nums'] },
    persistentSpeedUnit: { color: theme.textMuted, fontSize: 12, fontWeight: '600' },
    persistentSpeedNone: { color: theme.textMuted, fontSize: 13, fontWeight: '500', fontStyle: 'italic' },
    section: { marginBottom: 20 },
    label: { fontSize: 12, color: theme.textSecondary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: '600' },
    input: { backgroundColor: theme.inputBg, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: theme.text, borderWidth: 1, borderColor: theme.border },
    tabs: { flexDirection: 'row', marginBottom: 20, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: theme.border },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: theme.tabInactive },
    tabActive: { backgroundColor: theme.tabActive },
    tabText: { color: theme.textMuted, fontSize: 14, fontWeight: '600' },
    tabTextActive: { color: theme.text, fontWeight: '700' },
    pinInput: { backgroundColor: theme.inputBg, borderRadius: 12, padding: 16, fontSize: 28, color: theme.text, textAlign: 'center', letterSpacing: 10, borderWidth: 1, borderColor: theme.border, marginBottom: 12, fontVariant: ['tabular-nums'] },
    button: { backgroundColor: theme.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
    buttonDisabled: { opacity: 0.4 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    themeToggle: { position: 'absolute', top: insets.top + 12, right: 16, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
    themeToggleText: { color: theme.textSecondary, fontSize: 12, fontWeight: '600' },
  }), [theme, insets.top]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
        <Text style={styles.themeToggleText}>{mode === 'auto' ? 'Auto' : mode === 'dark' ? 'Dark' : 'Light'}</Text>
      </TouchableOpacity>

      <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
        <Text style={styles.title}>WhereMap</Text>
        <Text style={styles.subtitle}>Real-time location sharing</Text>

        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: connected ? theme.accentAlt : theme.danger }]} />
          <Text style={styles.statusText}>{connected ? 'Connected' : 'Connecting...'}</Text>
        </View>

        <View style={styles.persistentSpeedRow}>
          <Text style={styles.persistentSpeedLabel}>ALL-TIME TOP</Text>
          {topSpeed > 0 ? (
            <>
              <Text style={styles.persistentSpeedValue}>{topSpeed.toFixed(1)}</Text>
              <Text style={styles.persistentSpeedUnit}>km/h</Text>
            </>
          ) : (
            <Text style={styles.persistentSpeedNone}>No Top Speed Recorded</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Nickname</Text>
          <TextInput style={styles.input} value={nickname} onChangeText={setNickname} placeholder="Enter your nickname" placeholderTextColor={theme.textMuted} maxLength={20} autoCapitalize="none" />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Color</Text>
          <ColorPicker selectedColor={selectedColor} onSelect={setSelectedColor} />
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, mode_ === 'create' && styles.tabActive]} onPress={() => setMode_('create')}>
            <Text style={[styles.tabText, mode_ === 'create' && styles.tabTextActive]}>Create</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, mode_ === 'join' && styles.tabActive]} onPress={() => setMode_('join')}>
            <Text style={[styles.tabText, mode_ === 'join' && styles.tabTextActive]}>Join</Text>
          </TouchableOpacity>
        </View>

        {mode_ === 'create' ? (
          <TouchableOpacity style={[styles.button, !connected && styles.buttonDisabled]} onPress={handleCreate} disabled={!connected || loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Lobby</Text>}
          </TouchableOpacity>
        ) : (
          <View>
            <TextInput style={styles.pinInput} value={pin} onChangeText={(t) => setPin(t.replace(/[^0-9]/g, '').slice(0, 6))} placeholder="000000" placeholderTextColor={theme.textMuted} keyboardType="number-pad" maxLength={6} />
            <TouchableOpacity style={[styles.button, !connected && styles.buttonDisabled]} onPress={handleJoin} disabled={!connected || loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Join Lobby</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}