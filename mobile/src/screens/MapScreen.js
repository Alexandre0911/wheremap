import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  AppState,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useApp } from '../context/AppContext';
import {
  requestLocationPermissions,
  startWatchingLocation,
  stopWatchingLocation,
} from '../services/location';

const INITIAL_REGION = {
  latitude: 0,
  longitude: 0,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function MapScreen({ navigation }) {
  const {
    participants,
    socketId,
    updateLocation,
    requestLeaderboard,
    leaveLobby,
    lobby,
  } = useApp();

  const [hasPermission, setHasPermission] = useState(false);
  const [myLocation, setMyLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const mapRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const wasTrackingRef = useRef(false);

  const otherParticipants = participants.filter((p) => p.id !== socketId);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const granted = await requestLocationPermissions();
      if (!mounted) return;
      setHasPermission(granted);

      if (granted) {
        await startWatchingLocation((loc) => {
          if (!mounted) return;
          setMyLocation(loc);
          updateLocation(loc);
          setRegion((prev) => {
            if (!prev) {
              return {
                latitude: loc.latitude,
                longitude: loc.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              };
            }
            return prev;
          });
        });
      }
    };

    init();

    const sub = AppState.addEventListener('change', (nextState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        if (wasTrackingRef.current) {
          startWatchingLocation((loc) => {
            setMyLocation(loc);
            updateLocation(loc);
          });
        }
      } else if (nextState.match(/inactive|background/)) {
        wasTrackingRef.current = true;
        stopWatchingLocation();
      }
      appState.current = nextState;
    });

    return () => {
      mounted = false;
      stopWatchingLocation();
      sub.remove();
    };
  }, [updateLocation]);

  const handleLeave = useCallback(() => {
    stopWatchingLocation();
    leaveLobby();
    navigation.replace('Home');
  }, [leaveLobby, navigation]);

  const handleLeaderboard = useCallback(() => {
    requestLeaderboard();
    navigation.navigate('Leaderboard');
  }, [requestLeaderboard, navigation]);

  if (!region) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Acquiring GPS...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={hasPermission}
        showsMyLocationButton={true}
        showsCompass={true}
      >
        {otherParticipants
          .filter(
            (p) =>
              typeof p.latitude === 'number' &&
              typeof p.longitude === 'number' &&
              p.latitude !== 0 &&
              p.longitude !== 0
          )
          .map((p) => (
            <Marker
              key={p.id}
              coordinate={{
                latitude: p.latitude,
                longitude: p.longitude,
              }}
              pinColor={p.color}
              title={p.nickname}
              description={
                p.speed ? `${p.speed.toFixed(1)} km/h` : '0 km/h'
              }
            >
              <Callout tooltip>
                <View style={styles.callout}>
                  <View
                    style={[
                      styles.calloutDot,
                      { backgroundColor: p.color },
                    ]}
                  />
                  <View>
                    <Text style={styles.calloutName}>{p.nickname}</Text>
                    <Text style={styles.calloutSpeed}>
                      {p.speed ? `${p.speed.toFixed(1)} km/h` : '0 km/h'}
                    </Text>
                  </View>
                </View>
              </Callout>
            </Marker>
          ))}
      </MapView>

      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.leaderboardBtn}
          onPress={handleLeaderboard}
        >
          <Text style={styles.btnText}>Leaderboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.leaveBtn} onPress={handleLeave}>
          <Text style={styles.leaveBtnText}>Leave</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.speedCard}>
        <Text style={styles.speedLabel}>YOUR SPEED</Text>
        <View style={styles.speedRow}>
          <Text style={styles.speedValue}>
            {myLocation?.speed
              ? myLocation.speed.toFixed(1)
              : '0.0'}
          </Text>
          <Text style={styles.speedUnit}>km/h</Text>
        </View>
      </View>

      {!hasPermission && (
        <View style={styles.permissionBanner}>
          <Text style={styles.permissionText}>
            Location permission denied
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { color: '#888', fontSize: 16 },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leaderboardBtn: {
    backgroundColor: '#e94560',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  leaveBtn: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  leaveBtnText: { color: '#ccc', fontWeight: '600', fontSize: 13 },
  speedCard: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(22,33,62,0.92)',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  speedLabel: {
    color: '#888',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 2,
  },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  speedValue: {
    color: '#4ECDC4',
    fontSize: 36,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  speedUnit: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  permissionBanner: {
    position: 'absolute',
    bottom: 180,
    alignSelf: 'center',
    backgroundColor: 'rgba(233,69,96,0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  permissionText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  callout: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0f3460',
    gap: 8,
    minWidth: 120,
  },
  calloutDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  calloutName: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  calloutSpeed: {
    color: '#4ECDC4',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});
