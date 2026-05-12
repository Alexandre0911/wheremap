import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

export default function LobbyScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { lobby, participants, leaveLobby } = useApp();

  const handleStart = () => navigation.navigate('Map');
  const handleLeave = () => { leaveLobby(); navigation.replace('Home'); };
  const handleShare = async () => {
    if (!lobby?.pin) return;
    try { await Share.share({ message: `Join my WhereMap lobby! PIN: ${lobby.pin}\n\nwheremap://join/${lobby.pin}` }); } catch {}
  };

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 60, marginBottom: 24 },
    title: { fontSize: 28, fontWeight: '800', color: theme.text },
    pinBox: { alignItems: 'center', backgroundColor: theme.surface, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: theme.border },
    pinLabel: { fontSize: 9, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: 2, fontWeight: '600' },
    pin: { fontSize: 22, color: theme.accent, fontWeight: '800', letterSpacing: 4, fontVariant: ['tabular-nums'] },
    count: { fontSize: 13, color: theme.textSecondary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: '600' },
    list: { flex: 1 },
    listContent: { paddingBottom: 8 },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, backgroundColor: theme.surface, borderRadius: 12, marginBottom: 6 },
    rankBadge: { width: 24, alignItems: 'center', marginRight: 10 },
    rankText: { color: theme.textMuted, fontSize: 13, fontWeight: '600' },
    avatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    avatarText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    nickname: { color: theme.text, fontSize: 15, fontWeight: '500' },
    empty: { color: theme.textMuted, textAlign: 'center', marginTop: 40, fontSize: 14 },
    startButton: { backgroundColor: theme.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
    startButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    leaveButton: { paddingVertical: 14, alignItems: 'center' },
    leaveButtonText: { color: theme.textMuted, fontSize: 14 },
  }), [theme]);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Lobby</Text>
        {lobby?.pin && (
          <TouchableOpacity style={styles.pinBox} onPress={handleShare}>
            <Text style={styles.pinLabel}>PIN</Text>
            <Text style={styles.pin}>{lobby.pin}</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.count}>{participants.length} participant{participants.length !== 1 ? 's' : ''}</Text>

      <FlatList
        data={participants}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <View style={styles.rankBadge}><Text style={styles.rankText}>{index + 1}</Text></View>
            <View style={[styles.avatar, { backgroundColor: item.color }]}>
              <Text style={styles.avatarText}>{(item.nickname || '?')[0].toUpperCase()}</Text>
            </View>
            <Text style={styles.nickname}>{item.nickname}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Waiting for participants...</Text>}
      />

      <TouchableOpacity style={styles.startButton} onPress={handleStart}>
        <Text style={styles.startButtonText}>Enter Map View</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.leaveButton} onPress={handleLeave}>
        <Text style={styles.leaveButtonText}>Leave Lobby</Text>
      </TouchableOpacity>
    </View>
  );
}