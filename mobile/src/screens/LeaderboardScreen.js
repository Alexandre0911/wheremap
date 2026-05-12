import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useApp } from '../context/AppContext';

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

export default function LeaderboardScreen({ navigation }) {
  const { leaderboard, requestLeaderboard, lobby } = useApp();

  useEffect(() => {
    requestLeaderboard();
    const interval = setInterval(requestLeaderboard, 5000);
    return () => clearInterval(interval);
  }, [requestLeaderboard]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
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
              <View
                style={[
                  styles.rankBadge,
                  isMedal && { backgroundColor: MEDAL_COLORS[index] },
                ]}
              >
                <Text
                  style={[
                    styles.rankText,
                    isMedal && styles.rankTextMedal,
                  ]}
                >
                  {isMedal
                    ? ['1st', '2nd', '3rd'][index]
                    : `#${item.rank || index + 1}`}
                </Text>
              </View>
              <View
                style={[styles.avatar, { backgroundColor: item.color }]}
              >
                <Text style={styles.avatarText}>
                  {(item.nickname || '?')[0].toUpperCase()}
                </Text>
              </View>
              <Text style={styles.nickname}>{item.nickname}</Text>
              <View style={styles.speedBadge}>
                <Text style={styles.speedValue}>
                  {(item.topSpeed || 0).toFixed(1)}
                </Text>
                <Text style={styles.speedUnit}>km/h</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No speeds yet</Text>
            <Text style={styles.emptySub}>
              Speeds will appear as people move
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 8,
  },
  backText: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '600',
    marginBottom: 16,
  },
  list: {
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  rankBadge: {
    width: 40,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0f3460',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '700',
  },
  rankTextMedal: {
    color: '#1a1a2e',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  nickname: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  speedBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    backgroundColor: '#0f3460',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  speedValue: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  speedUnit: {
    color: '#666',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    color: '#888',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptySub: {
    color: '#555',
    fontSize: 14,
  },
});
