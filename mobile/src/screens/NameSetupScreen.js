import React, { useState, useRef } from 'react';
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
import { getSocket } from '../services/socket';
import { saveDisplayId } from '../services/storage';

export default function NameSetupScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [step, setStep] = useState('input');
  const [loading, setLoading] = useState(false);
  const confirmedName = useRef('');

  const handleCheck = async () => {
    const trimmed = name.trim();
    if (!trimmed) { Alert.alert('Error', 'Enter a permanent name'); return; }
    if (trimmed.length < 2) { Alert.alert('Error', 'Name must be at least 2 characters'); return; }
    if (trimmed.length > 20) { Alert.alert('Error', 'Name must be at most 20 characters'); return; }

    setLoading(true);
    const socket = getSocket();
    if (!socket?.connected) { Alert.alert('Error', 'Not connected to server'); setLoading(false); return; }

    socket.emit('check_name', trimmed, (taken) => {
      setLoading(false);
      if (taken) {
        Alert.alert('Name Taken', 'This permanent name is already in use by someone else. Choose another.');
      } else {
        confirmedName.current = trimmed;
        setStep('confirm');
      }
    });
  };

  const handleClaim = async () => {
    setLoading(true);
    const socket = getSocket();
    if (!socket?.connected) { Alert.alert('Error', 'Not connected to server'); setLoading(false); return; }

    socket.emit('claim_name', confirmedName.current, (success) => {
      setLoading(false);
      if (success) {
        saveDisplayId(confirmedName.current);
        navigation.replace('Home');
      } else {
        Alert.alert('Error', 'Someone else claimed this name. Try another.');
        setStep('input');
      }
    });
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    content: { flex: 1, padding: 24, justifyContent: 'center' },
    title: { fontSize: 28, fontWeight: '800', color: theme.text, textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 15, color: theme.textSecondary, textAlign: 'center', marginBottom: 40 },
    label: { fontSize: 12, color: theme.textSecondary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: '600' },
    input: { backgroundColor: theme.inputBg, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: theme.text, borderWidth: 1, borderColor: theme.border },
    button: { backgroundColor: theme.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    warningBox: { backgroundColor: theme.surface, borderRadius: 14, padding: 20, borderWidth: 1, borderColor: theme.border, marginBottom: 16 },
    warningTitle: { color: theme.danger, fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
    warningText: { color: theme.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
    nameDisplay: { backgroundColor: theme.surfaceAlt, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16, alignSelf: 'center', marginBottom: 16 },
    nameDisplayText: { color: theme.accent, fontSize: 20, fontWeight: '800', textAlign: 'center', letterSpacing: 1 },
    buttonSecondary: { paddingVertical: 12, alignItems: 'center' },
    buttonSecondaryText: { color: theme.textMuted, fontSize: 14 },
  });

  if (step === 'confirm') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.content}>
          <Text style={styles.title}>Permanent Name</Text>
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>⚠️ This cannot be changed</Text>
            <Text style={styles.warningText}>
              This name is your permanent identifier. It can never be edited, changed, or removed. 
              Everyone will see this name. Make sure it's what you want.
            </Text>
          </View>
          <View style={styles.nameDisplay}>
            <Text style={styles.nameDisplayText}>{confirmedName.current}</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleClaim} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Confirm & Continue</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonSecondary} onPress={() => setStep('input')}>
            <Text style={styles.buttonSecondaryText}>Go back and change it</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
        <Text style={styles.title}>Welcome to WhereMap</Text>
        <Text style={styles.subtitle}>Choose your permanent name</Text>
        <Text style={styles.label}>Permanent Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your permanent name"
          placeholderTextColor={theme.textMuted}
          maxLength={20}
          autoCapitalize="none"
          autoFocus
        />
        <TouchableOpacity style={styles.button} onPress={handleCheck} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Next</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}