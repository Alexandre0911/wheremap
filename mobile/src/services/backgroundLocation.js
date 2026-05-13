import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCATION_TASK = 'wheremap-background-location';
const CREDS_KEY = '@wheremap/bg_creds';

TaskManager.defineTask(LOCATION_TASK, async ({ data, error }) => {
  if (error) return;
  if (!data?.locations?.length) return;

  const location = data.locations[0];
  const creds = await AsyncStorage.getItem(CREDS_KEY);
  if (!creds) return;

  const { serverUrl, lobbyId, participantId } = JSON.parse(creds);
  const { latitude, longitude, speed: speedMps } = location.coords;
  const speed = speedMps > 0 ? parseFloat((speedMps * 3.6).toFixed(1)) : 0;

  try {
    await fetch(`${serverUrl}/api/location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lobbyId, participantId, latitude, longitude, speed }),
    });
  } catch {}
});

export async function requestBackgroundPermissions() {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  return status === 'granted';
}

export async function startBackgroundTracking(serverUrl, lobbyId, participantId) {
  const granted = await requestBackgroundPermissions();
  if (!granted) return false;

  await AsyncStorage.setItem(CREDS_KEY, JSON.stringify({ serverUrl, lobbyId, participantId }));

  const isRunning = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK);
  if (!isRunning) {
    await Location.startLocationUpdatesAsync(LOCATION_TASK, {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 5000,
      distanceInterval: 10,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'WhereMap',
        notificationBody: 'Sharing your location',
        notificationColor: '#e94560',
      },
    });
  }
  return true;
}

export async function stopBackgroundTracking() {
  await AsyncStorage.removeItem(CREDS_KEY);
  const isRunning = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK);
  if (isRunning) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK);
  }
}

export async function isBackgroundTrackingActive() {
  return TaskManager.isTaskRegisteredAsync(LOCATION_TASK);
}