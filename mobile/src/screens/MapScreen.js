import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  AppState,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
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

  const [selectedPerson, setSelectedPerson] = useState(null);

  const handleMarkerPress = useCallback((person) => {
    setSelectedPerson(person);
  }, []);

  const handleClosePerson = useCallback(() => {
    setSelectedPerson(null);
  }, []);

  const handleNavigateTo = useCallback((lat, lng, nickname) => {
    const dest = `${lat},${lng}`;
    const urlGoogle = `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
    const urlApple = `http://maps.apple.com/?daddr=${dest}`;
    const urlWaze = `https://waze.com/ul?ll=${dest}&navigate=yes`;
    
    if (Platform.OS === 'ios') {
      Alert.alert(`Navigate to ${nickname}`, 'Choose app', [
        { text: 'Apple Maps', onPress: () => Linking.openURL(urlApple) },
        { text: 'Google Maps', onPress: () => Linking.openURL(urlGoogle) },
        { text: 'Waze', onPress: () => Linking.openURL(urlWaze) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } else {
      Alert.alert(`Navigate to ${nickname}`, 'Choose app', [
        { text: 'Google Maps', onPress: () => Linking.openURL(urlGoogle) },
        { text: 'Waze', onPress: () => Linking.openURL(urlWaze) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  }, []);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, []);

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
              onPress={() => handleMarkerPress(p)}
              />
          ))}
      </MapView>

      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.leaderboardBtn}
          onPress={handleLeaderboard}
        >
          <Text style={styles.btnText}>🏆</Text>
        </TouchableOpacity>

        <View style={styles.centerWrapper}>
          <TouchableOpacity style={styles.lobbyBtn} onPress={handleGoBack}>
            <Text style={styles.lobbyBtnText}>Lobby</Text>
          </TouchableOpacity>
        </View>

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

      {selectedPerson && (
        <View style={styles.personCard}>
          <View style={styles.personCardContent}>
            <View style={[styles.personDot, { backgroundColor: selectedPerson.color }]} />
            <View style={styles.personInfo}>
              <Text style={styles.personName}>{selectedPerson.nickname}</Text>
              <Text style={styles.personSpeed}>
                {selectedPerson.speed ? `${selectedPerson.speed.toFixed(1)} km/h` : '0 km/h'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => {
                handleNavigateTo(
                  selectedPerson.latitude,
                  selectedPerson.longitude,
                  selectedPerson.nickname
                );
                setSelectedPerson(null);
              }}
            >
              <Text style={styles.navButtonText}>Navigate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClosePerson}>
              <Text style={styles.closeBtnText}>x</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
    alignItems: 'center',
  },
  centerWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  leaderboardBtn: {
    backgroundColor: '#e94560',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  lobbyBtn: {
    backgroundColor: '#0f3460',
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
  lobbyBtnText: { color: '#4ECDC4', fontWeight: '600', fontSize: 13 },
  leaveBtnText: { color: '#ccc', fontWeight: '600', fontSize: 13 },
  speedCard: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(22,33,62,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  speedLabel: {
    color: '#888',
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 1,
  },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  speedValue: {
    color: '#4ECDC4',
    fontSize: 22,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  speedUnit: {
    color: '#666',
    fontSize: 11,
    fontWeight: '600',
  },
  personCard: {
    position: 'absolute',
    bottom: 180,
    left: 16,
    right: 16,
  },
  personCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#0f3460',
    gap: 10,
  },
  personDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  personSpeed: {
    color: '#4ECDC4',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  navButton: {
    backgroundColor: '#e94560',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  navButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '700',
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
});
