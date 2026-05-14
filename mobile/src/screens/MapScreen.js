import React, { useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

export default function MapScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const { participants, participantId, myLocation, hasLocationPermission, requestLeaderboard, leaveLobby } = useApp();

  const otherParticipants = participants.filter((p) => p.id !== participantId);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const mapRef = useRef(null);

  const region = myLocation
    ? { latitude: myLocation.latitude, longitude: myLocation.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }
    : null;

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

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

  const handleMarkerPress = useCallback((person) => setSelectedPerson(person), []);
  const handleClosePerson = useCallback(() => setSelectedPerson(null), []);
  const handleGoBack = useCallback(() => navigation.goBack(), [navigation]);
  const handleLeave = useCallback(() => { leaveLobby(); navigation.replace('Home'); }, [leaveLobby, navigation]);
  const handleLeaderboard = useCallback(() => { requestLeaderboard(); navigation.navigate('Leaderboard'); }, [requestLeaderboard, navigation]);

  const darkStyle = [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#283d54' }] },
    { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
  ];

  const mapStyle = Platform.OS === 'android' && isDark ? darkStyle : undefined;

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1 },
    map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
    loadingContainer: { flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: theme.textSecondary, fontSize: 16 },
    topBar: { position: 'absolute', top: 50, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    centerWrapper: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
    leaderboardBtn: { backgroundColor: theme.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
    lobbyBtn: { backgroundColor: theme.surfaceAlt, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
    leaveBtn: { backgroundColor: theme.overlayDark, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
    btnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    lobbyBtnText: { color: theme.accent, fontWeight: '600', fontSize: 13 },
    leaveBtnText: { color: '#ccc', fontWeight: '600', fontSize: 13 },
    speedCard: { position: 'absolute', bottom: 100, alignSelf: 'center', backgroundColor: theme.overlay, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: theme.border },
    speedLabel: { color: theme.textSecondary, fontSize: 8, fontWeight: '600', letterSpacing: 1 },
    speedRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
    speedValue: { color: theme.accent, fontSize: 22, fontWeight: '800', fontVariant: ['tabular-nums'] },
    speedUnit: { color: theme.textMuted, fontSize: 11, fontWeight: '600' },
    personCard: { position: 'absolute', bottom: 180, left: 16, right: 16 },
    personCardContent: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: theme.border, gap: 10 },
    personDot: { width: 14, height: 14, borderRadius: 7 },
    personInfo: { flex: 1 },
    personName: { color: theme.text, fontWeight: '700', fontSize: 15 },
    personSpeed: { color: theme.accent, fontSize: 13, fontWeight: '600', marginTop: 2 },
    personDistance: { color: theme.textMuted, fontSize: 11, marginTop: 1 },
    navButton: { backgroundColor: theme.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
    navButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    closeBtn: { width: 24, height: 24, borderRadius: 12, backgroundColor: theme.overlayDark, justifyContent: 'center', alignItems: 'center' },
    closeBtnText: { color: theme.textSecondary, fontSize: 14, fontWeight: '700' },
    permissionBanner: { position: 'absolute', bottom: 180, alignSelf: 'center', backgroundColor: 'rgba(233,69,96,0.9)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
    permissionText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  }), [theme]);

  if (!region) {
    return <View style={styles.loadingContainer}><Text style={styles.loadingText}>Acquiring GPS...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <MapView ref={mapRef} style={styles.map} initialRegion={region} showsUserLocation={hasLocationPermission} showsMyLocationButton showsCompass customMapStyle={mapStyle} mapType={Platform.OS === 'ios' && isDark ? 'mutedStandard' : 'standard'}>
        {otherParticipants.filter((p) => typeof p.latitude === 'number' && typeof p.longitude === 'number' && p.latitude !== 0 && p.longitude !== 0).map((p) => (
          <Marker key={p.id} coordinate={{ latitude: p.latitude, longitude: p.longitude }} pinColor={p.color} onPress={() => handleMarkerPress(p)} />
        ))}
      </MapView>

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.leaderboardBtn} onPress={handleLeaderboard}><Text style={styles.btnText}>🏆</Text></TouchableOpacity>
        <View style={styles.centerWrapper}>
          <TouchableOpacity style={styles.lobbyBtn} onPress={handleGoBack}><Text style={styles.lobbyBtnText}>Lobby</Text></TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.leaveBtn} onPress={handleLeave}><Text style={styles.leaveBtnText}>Leave</Text></TouchableOpacity>
      </View>

      <View style={styles.speedCard}>
        <Text style={styles.speedLabel}>YOUR SPEED</Text>
        <View style={styles.speedRow}>
          <Text style={styles.speedValue}>{myLocation?.speed ? myLocation.speed.toFixed(1) : '0.0'}</Text>
          <Text style={styles.speedUnit}>km/h</Text>
        </View>
      </View>

      {selectedPerson && myLocation && (() => {
        const dist = getDistance(myLocation.latitude, myLocation.longitude, selectedPerson.latitude, selectedPerson.longitude);
        return (
        <View style={styles.personCard}>
          <View style={styles.personCardContent}>
            <View style={[styles.personDot, { backgroundColor: selectedPerson.color }]} />
            <View style={styles.personInfo}>
              <Text style={styles.personName}>{selectedPerson.nickname}</Text>
              <Text style={styles.personSpeed}>{selectedPerson.speed ? `${selectedPerson.speed.toFixed(1)} km/h` : '0 km/h'}</Text>
              <Text style={styles.personDistance}>{dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(2)} km`} away</Text>
            </View>
            <TouchableOpacity style={styles.navButton} onPress={() => { handleNavigateTo(selectedPerson.latitude, selectedPerson.longitude, selectedPerson.nickname); setSelectedPerson(null); }}>
              <Text style={styles.navButtonText}>Navigate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClosePerson}><Text style={styles.closeBtnText}>x</Text></TouchableOpacity>
          </View>
        </View>
        );
      })()}

      {!hasLocationPermission && (
        <View style={styles.permissionBanner}><Text style={styles.permissionText}>Location permission denied</Text></View>
      )}
    </View>
  );
}