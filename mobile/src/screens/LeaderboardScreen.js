import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

export default function LeaderboardScreen({ navigation }) {
  const { theme } = useTheme();
  const { leaderboard, requestLeaderboard } = useApp();

  useEffect(() => {
    requestLeaderboard();
    const interval = setInterval(requestLeaderboard, 5000);
    return () => clearInterval(interval);
  }, [requestLeaderboard]);

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 60, marginBottom: 8 },
    backText: { color: theme.primary, fontSize: 16, fontWeight: '600' },
    title: { fontSize: 22, fontWeight: '800', color: theme.text },
    subtitle: { fontSize: 12, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: 2, fontWeight: '600', marginBottom: 16 },
    list: { paddingBottom: 20 },
    row: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 14, marginBottom: 8 },
    rankBadge: { width: 40, height: 32, borderRadius: 8, backgroundColor: theme.surfaceAlt, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    rankText: { color: theme.textMuted, fontSize: 13, fontWeight: '700' },
    rankTextMedal: { color: '#1a1a2e' },
    avatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    avatarText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    nickname: { flex: 1, color: theme.text, fontSize: 15, fontWeight: '500' },
    speedBadge: { flexDirection: 'row', alignItems: 'baseline', gap: 3, backgroundColor: theme.surfaceAlt, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    speedValue: { color: theme.accent, fontSize: 16, fontWeight: '800', fontVariant: ['tabular-nums'] },
    speedUnit: { color: theme.textMuted, fontSize: 11, fontWeight: '600' },
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyTitle: { color: theme.textSecondary, fontSize: 18, fontWeight: '600', marginBottom: 6 },
    emptySub: { color: theme.textMuted, fontSize: 14 },
  }), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>Back</Text></TouchableOpacity>
        <Text style={styles.title}>Leaderboard</Text>
        <View style={{ width: 40 }} />
      </View>
      <Text style={styles.subtitle}>Top Speeds</Text>
      <FlatList
        data={leaderboard}
        keyExtractor={(item, i) => `${item.nickname}-${i}`}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => {
          const isMedal = index < 3;
          return (
            <View style={styles.row}>
              <View style={[styles.rankBadge, isMedal && { backgroundColor: MEDAL_COLORS[index] }]}>
                <Text style={[styles.rankText, isMedal && styles.rankTextMedal]}>
                  {['1st', '2nd', '3rd'][index] || `#${item.rank || index + 1}`}
                </Text>
              </View>
              <View style={[styles.avatar, { backgroundColor: item.color }]}>
                <Text style={styles.avatarText}>{(item.nickname || '?')[0].toUpperCase()}</Text>
              </View>
              <Text style={styles.nickname}>{item.nickname}</Text>
              <View style={styles.speedBadge}>
                <Text style={styles.speedValue}>{(item.topSpeed || 0).toFixed(1)}</Text>
                <Text style={styles.speedUnit}>km/h</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No speeds yet</Text>
            <Text style={styles.emptySub}>Speeds will appear as people move</Text>
          </View>
        }
      />
    </View>
  );
}